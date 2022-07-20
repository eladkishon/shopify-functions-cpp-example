
cd ..
em++ -std=c++1z src/main.cpp -o build/main.js
# cat test/input.example.json | tr '\n' ' ' | node build/hello.js > test/output.example.json
cat test/input.example.json | tr '\n' ' ' | node build/main.js