# adstrackerfunction

This is an Azure Computer function of the type Timer Trigger that triggers a POST request to GitHub to retrieve all open and closed issues and then store it to a Cloud Flare database. The scheduled cron job runs every hour. This function is used to power the [Azure Data Studio Issue Tracker](https://ads-issue-tracker.netlify.com/)

# Run help

This function can only be deployed to Azure when run via node-ia32