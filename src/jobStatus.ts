export class JobStatus {
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
