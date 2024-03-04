import * as core from '@actions/core';
import * as github from '@actions/github';
import { Octokit } from '@octokit/core';
import { PaginateInterface } from '@octokit/plugin-paginate-rest';
import { Api } from '@octokit/plugin-rest-endpoint-methods/dist-types/types';

async function checkWorkflows(octokit: Octokit & Api & { paginate: PaginateInterface; }, owner: string, repo: string, ignoreActions: string | any[]): Promise<boolean> {
  const workflows = await octokit.rest.actions.listWorkflowRunsForRepo({
    owner,
    repo,
    status: 'completed'
  });

  return workflows.data.workflow_runs.every(run => {
    return ignoreActions.includes(run.name!) || run.conclusion === 'success';
  });
}

export async function run(): Promise<void> {
  try {
    const token = core.getInput('repo-token', { required: true });
    const ignoreActionsInput = core.getInput('ignore-actions');
    const ignoreActions = ignoreActionsInput ? ignoreActionsInput.split(',').map(action => action.trim()) : [];
    const interval = parseInt(core.getInput('interval'), 10) || 60000; // Default to 60 seconds

    const octokit = github.getOctokit(token);
    const { owner, repo } = github.context.repo;

    let allSuccessful = false;
    while (!allSuccessful) {
      allSuccessful = await checkWorkflows(octokit, owner, repo, ignoreActions);
      if (!allSuccessful) {
        core.info('Not all workflows are successful. Waiting...');
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }

    core.setOutput('status', 'success');
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
