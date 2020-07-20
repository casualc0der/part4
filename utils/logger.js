// extract all logging into its own module, so we can switch 
// out the logging methods as required (3rd party services etc)

const info = (...params) => {
  console.log(...params)
}

const error = (...params) => {
  console.error(..params)
}

module.exports= {
  info, error
}