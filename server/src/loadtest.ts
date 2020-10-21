import { loadTest } from './loadtest/runner'
import { userScript } from './loadtest/userScript'

loadTest(userScript).catch(err => console.error(err))
