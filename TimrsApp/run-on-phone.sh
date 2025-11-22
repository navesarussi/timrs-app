#!/bin/bash

# סקריפט להרצת האפליקציה על הטלפון עם Java 17

export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

echo "🚀 מריץ את האפליקציה על הטלפון..."
echo "Java version:"
java -version

npx react-native run-android

