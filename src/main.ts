import * as core from '@actions/core'
import * as github from '@actions/github'

class JobStatus {
  totalJobs: string[] = []
  completeJobs: string[] = []
  errJobs: string[] = []
  ignoredJobs: string[] = []

  constructor(
    totalJobs: string[],
    completeJobs: string[],
    errJobs: string[],
    ignoredJobs: string[]
  ) {
    this.totalJobs = totalJobs
    this.completeJobs = completeJobs
    this.errJobs = errJobs
    this.ignoredJobs = ignoredJobs
  }

  isSuccess(): boolean {
    return (
      this.errJobs.length === 0 &&
      this.completeJobs.length === this.totalJobs.length
    )
  }

  detail(): string {
    const incompleteJobs = this.getIncompleteJobs()
    let result = `${this.completeJobs.length} out of ${this.totalJobs.length}
Total job count:       ${this.totalJobs.length}
Completed job count:   ${this.completeJobs.length}
Incompleted job count: ${incompleteJobs.length}
Failed job count:      ${this.errJobs.length}
Ignored job count:     ${this.ignoredJobs.length}`

    result += `
::group::Failed jobs
${this.prettyPrintJobList(this.errJobs)}
::endgroup::
::group::Completed jobs
${this.prettyPrintJobList(this.completeJobs)}
::endgroup::
::group::Incomplete jobs
${this.prettyPrintJobList(incompleteJobs)}
::endgroup::
::group::Ignored jobs
${this.prettyPrintJobList(this.ignoredJobs)}
::endgroup::
::group::All jobs
${this.prettyPrintJobList(this.totalJobs)}
::endgroup::`

    return result
  }

  private prettyPrintJobList(jobs: string[]): string {
    return jobs.length === 0 ? '[]' : jobs.map(job => `- ${job}`).join('\n')
  }

  private getIncompleteJobs(): string[] {
    return this.totalJobs.filter(
      job =>
        !this.completeJobs.includes(job) &&
        !this.errJobs.includes(job) &&
        !this.ignoredJobs.includes(job)
    )
  }
}

async function getJobStatuses(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string
): Promise<JobStatus> {
  const runs = await octokit.rest.actions.listWorkflowRunsForRepo({
    owner,
    repo,
    status: 'completed'
  })

  const jobStatuses = new JobStatus([], [], [], [])

  for (const ran of runs.data.workflow_runs) {
    const jobs = await octokit.rest.actions.listJobsForWorkflowRun({
      owner,
      repo,
      run_id: ran.id
    })
    core.info(`jobs: ${JSON.stringify(jobs.data.jobs, null, 2)}`)
    for (const job of jobs.data.jobs) {
      jobStatuses.totalJobs.push(job.name)
      if (job.conclusion === 'success') {
        jobStatuses.completeJobs.push(job.name)
      } else if (job.conclusion !== 'skipped') {
        // Assuming 'skipped' jobs are ignored
        jobStatuses.errJobs.push(job.name)
      }
    }
  }

  return jobStatuses
}

export async function run(): Promise<void> {
  try {
    const token = core.getInput('repo-token', { required: true })
    const interval = parseInt(core.getInput('interval'), 10) || 60000

    const octokit = github.getOctokit(token)
    const { owner, repo } = github.context.repo

    let jobStatuses = await getJobStatuses(octokit, owner, repo)
    while (!jobStatuses.isSuccess()) {
      core.info('Not all jobs are successful. Waiting...')
      await new Promise<void>(resolve => setTimeout(resolve, interval))
      jobStatuses = await getJobStatuses(octokit, owner, repo)
    }

    core.info(jobStatuses.detail())
    core.setOutput('status', 'success')
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()
