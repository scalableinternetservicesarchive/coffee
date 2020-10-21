/**
 * A user script is a sequence of HTTP request (REST/GraphQL API requests, page loads, etc.)
 *
 * Each user arriving at the site during the load test will execute the user script.
 */
export type UserScript = () => Promise<any>

export async function userScript() {
  await fetch('https://bespin.cloudcity.computer/')
  await fetch('https://bespin.cloudcity.computer/')
  await fetch('https://bespin.cloudcity.computer/')
}

// set this is you require authenticated requests
// const authToken = undefined

// function makeApolloClient() {
//   return new ApolloClient({
//     ssrMode: true,
//     link: new HttpLink({
//       uri: `https://bespin.cloudcity.computer/graphql`,
//       credentials: 'same-origin',
//       fetch: async (uri: any, options: any) => {
//         const reqBody = JSON.parse(options!.body! as string)
//         const opName = reqBody.operationName
//         const actionName = reqBody.variables?.action?.actionName
//         const headers = authToken ? { ...options.headers, 'x-authtoken': authToken } : options.headers
//         return fetch(`${uri}?opName=${opName}${actionName ? `&actionName=${actionName}` : ''}`, {
//           ...options,
//           headers,
//         })
//       },
//     }),
//     cache: new InMemoryCache(),
//   })
// }
