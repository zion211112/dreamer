#!/bin/sh
cd "c:/Users/PC/Documents/dreamer/tmp-shot"
echo skipping-rm
npm i puppeteer-core --no-audit --no-fund > install.log 2>&1
echo "npm exit $?:" >> install.log
node capture.cjs > capture.log 2>&1
echo "capture exit $?:" >> capture.log
echo ALLDONE > capture-all.done
