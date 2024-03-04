// import * as core from '@actions/core'
// import * as github from '@actions/github'
// import { run } from '../src/main'

// jest.mock('@actions/core')
// jest.mock('@actions/github')

// jest.mock('@actions/github', () => ({
//   getOctokit: jest.fn(),
//   context: {
//     repo: {
//       owner: 'test-owner',
//       repo: 'test-repo'
//     }
//   }
// }))

// describe('Merge Gatekeeper Action', () => {
//   let mockListWorkflowRunsForRepo: jest.Mock

//   beforeEach(() => {
//     jest.clearAllMocks()

//     const inputs = {
//       'repo-token': 'token',
//       'ignore-actions': 'action1,action2',
//       interval: '60000'
//     }

//     jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
//       return inputs[name as keyof typeof inputs] || ''
//     })

//     jest.spyOn(core, 'setOutput')
//     jest.spyOn(core, 'setFailed')

//     mockListWorkflowRunsForRepo = jest.fn()
//     jest.spyOn(github, 'getOctokit').mockImplementation(
//       () =>
//         ({
//           rest: {
//             actions: {
//               listWorkflowRunsForRepo: mockListWorkflowRunsForRepo
//             }
//           }
//           // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         }) as any
//     )
//   })

//   it('should set status to success when all workflows are successful', async () => {
//     mockListWorkflowRunsForRepo.mockResolvedValue({
//       data: {
//         workflow_runs: [{ name: 'action3', conclusion: 'success' }]
//       }
//     })

//     await run()

//     expect(core.setOutput).toHaveBeenCalledWith('status', 'success')
//   })

//   // it('should wait and retry if not all workflows are successful', async () => {
//   //   jest.useFakeTimers();

//   //   // First call: one workflow is not successful
//   //   mockListWorkflowRunsForRepo.mockResolvedValueOnce({
//   //     data: {
//   //       workflow_runs: [
//   //         { name: 'action3', conclusion: 'failure' }
//   //       ]
//   //     }
//   //   });

//   //   // Second call: all workflows are successful
//   //   mockListWorkflowRunsForRepo.mockResolvedValueOnce({
//   //     data: {
//   //       workflow_runs: [
//   //         { name: 'action3', conclusion: 'success' }
//   //       ]
//   //     }
//   //   });

//   //   const promise = run();

//   //   // Fast-forward time
//   //   jest.advanceTimersByTime(60000);

//   //   await promise;

//   //   expect(core.setOutput).toHaveBeenCalledWith('status', 'success');
//   //   jest.useRealTimers();
//   // }, 10000);

//   it('should handle errors and set failed status', async () => {
//     const errorMessage = 'Error fetching workflows'
//     mockListWorkflowRunsForRepo.mockRejectedValue(new Error(errorMessage))

//     await run()

//     expect(core.setFailed).toHaveBeenCalledWith(errorMessage)
//   })

//   // Add more test cases as necessary
// })
