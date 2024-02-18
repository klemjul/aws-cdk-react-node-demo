import path from "path"
import { fileURLToPath } from "url"

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const lambdasProjectPath = path.join(dirname, "..", "..", "lambdas")
const webappProjectPath = path.join(dirname, "..", "..", "webapp")

export { lambdasProjectPath, webappProjectPath }
