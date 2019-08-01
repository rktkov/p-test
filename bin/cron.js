/**
 * Created by olegk on 01/08/2019.
 */

const monitor = require('../cron/cronPayload');

function start() {
    monitor.start_job();

    process.on('exit', function(code){
        monitor.stop_job();
    })
}

start();
//process.send('READY');
