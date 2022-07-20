package main

// This calls a JS function from Go.
func main() {
	println("adding two numbers:", multiply(2, 3)) // expecting 5
	// get line from stdin
}

func multiply(x, y int) int {
	return x * y
}
