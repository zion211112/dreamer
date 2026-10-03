#!/bin/sh
cd "c:/Users/PC/Documents/dreamer/tmp-shot"
node capture.cjs > capture3.log 2>&1
echo "exit $?" >> capture3.log
