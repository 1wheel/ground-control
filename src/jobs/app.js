var CronJob = require('cron').CronJob;
var async = require('async')

// jobs contains paths to jobs and crons for each job
var jobs = require('./jobs.json').jobs;
var crons = []
var log = require('../backend/log');

// Create a cron for each job
async.forEach(jobs,init_job,function(e) {
  // If a single cron fails, we kill the entire process. The thought is that
  // the process shouldn't "appear" to be working even if significant jobs
  // are not running. Bring the process down, fix it, and bring it back up.
  if(e) {
    log.error("Failed to initialize cron jobs");
    log.error(e);
    process.exit(1);
  }
});

// init_job takes a job with the following two properties:
//   * job - path to a node module. Refer to the readme for building the module.
//   * cron - a valid cron schedule
function init_job(job, cb) {

  // Make sure that a job file was specified.
  // Require would fail later down the file, but this gives
  // a better error message.
  if(!job.job) {
    cb(new Error('Job specified without a js file'));
  }

  // Get the module for the job
  try {
    job.module = require(job.job);
  } catch(e) {
    // If we can't get the module, we fail
    return cb(e);
  }

  // Make sure a cron is specified
  if(!job.cron) {
    // We log the job path for easier debugging
    log.error(job.job);
    return cb(new Error('Job specified without cron'));
  }

  // Make sure there is an init function
  job.module.init = job.module.init || function(cb){cb();};

  // Give our module a chance to allocate any resources necessary for the job
  job.module.init(function job_init_complete(e) {
    if(e) {
      // Log the job for easier debugging
      log.error(job.job);
      return cb(e)
    }

    // The Cron module thorws if the cron string is invalid
    try {
      log.info("Initializing:",job.job);
      // Create the new job
      crons.push(new CronJob(
        job.cron,
        function execute_job() {
          log.info("Executing:",job.job);
          job.module.job();
        },
        function job_finished() {},
        true, // start immediately,
        "US/Eastern" // this shouldn't really matter
      ));

    } catch(e) {
      // Log the job for easier debugging
      log.error(job.job);
      return cb(e)
    }
  });

};

/*
*/
