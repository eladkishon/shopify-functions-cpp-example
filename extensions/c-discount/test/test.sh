
cd ..
em++ -std=c++1z src/main.cpp -o build/main.js
cat test/input.example.json | tr '\n' ' ' | node --trace-uncaught build/main.js > test/output.example.json
cat test/input.example.json | tr '\n' ' ' | node --trace-uncaught build/main.js