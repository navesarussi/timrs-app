# Important: Set Java 17 for this project

# Add this to your ~/.zshrc or run before every build:
export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home

# Or create a script to run the app:
# run-android.sh:
#!/bin/bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
cd /Users/navesarussi/timrs/TimrsApp
npm run android

