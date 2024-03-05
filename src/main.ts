import * as core from '@actions/core'
import * as github from '@actions/github'

async function getJobStatuses(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  context: typeof github.context = github.context
): Promise<void> {
  const ref = context.payload.pull_request?.head.sha
  const check_runs = (
    await octokit.rest.checks.listForRef({
      owner,
      repo,
      ref
    })
  ).data.check_runs

  core.info(`Check runs: ${JSON.stringify(check_runs, null, 2)}`)

  for (const ran of check_runs) {
    core.info(
      `Check run: ${ran.app?.slug}, ID: ${ran.id}, currentJobId: ${context.runId}, ghjob: ${context.job}`
    )
    if (ran.name === 'GitHub Actions Test') {
      core.info(
        `Check run: ${JSON.stringify(ran, null, 2)}, context: ${JSON.stringify(context, null, 2)}`
      )
    }

    if (ran.app?.slug === 'github-actions' && ran.id !== context.runId) {
      // Get the corresponding Actions job.
      // The Actions job ID is the same as the Checks run ID
      // (not to be confused with the Actions run ID).
      const job = (
        await octokit.rest.actions.getJobForWorkflowRun({
          owner,
          repo,
          job_id: ran.id
        })
      ).data

      // Now, get the Actions run that this job is in.
      const actions_run = (
        await octokit.rest.actions.getWorkflowRun({
          owner,
          repo,
          run_id: job.run_id
        })
      ).data
      core.info(
        `Job: ${job.name}, Status: ${job.status}, Conclusion: ${job.conclusion}`
      )
      core.info(`Actions Run: ${actions_run.id}, Event: ${actions_run.event}`)
    }
  }

  // const jobStatuses = new JobStatus([], [], [], [])

  // // Log the current run ID
  // core.info(`Current Workflow Run ID: ${currentRunId}`)

  // // Fetch and log the jobs for the current workflow run
  // const jobs = await octokit.rest.actions.listJobsForWorkflowRun({
  //   owner,
  //   repo,
  //   run_id: parseInt(currentRunId, 10)
  // })

  // for (const job of jobs.data.jobs) {
  //   core.info(
  //     `Job: ${job.name}, Status: ${job.status}, Conclusion: ${job.conclusion}`
  //   )
  //   jobStatuses.totalJobs.push(job.name)
  //   if (job.conclusion === 'success') {
  //     jobStatuses.completeJobs.push(job.name)
  //   } else if (job.conclusion !== 'skipped') {
  //     // Assuming 'skipped' jobs are ignored
  //     jobStatuses.errJobs.push(job.name)
  //   }
  // }

  return
}

export async function run(): Promise<void> {
  try {
    const token = core.getInput('repo-token', { required: true })
    // const interval = parseInt(core.getInput('interval'), 10) || 60000

    const octokit = github.getOctokit(token)
    const { owner, repo } = github.context.repo

    // let jobStatuses = await getJobStatuses(octokit, owner, repo)
    core.info('About to run getJobStatuses')
    await getJobStatuses(octokit, owner, repo)
    // while (!jobStatuses.isSuccess()) {
    //   core.info('Not all jobs are successful. Waiting...')
    //   core.info(jobStatuses.detail())
    //   await new Promise<void>(resolve => setTimeout(resolve, interval))
    //   jobStatuses = await getJobStatuses(octokit, owner, repo)
    // }

    core.setOutput('status', 'success')
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}
