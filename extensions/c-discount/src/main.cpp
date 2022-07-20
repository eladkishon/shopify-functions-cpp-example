#include <iostream>
#include "json_struct.h"
#include "api.h"

FunctionResult function(Input input) {
  FunctionResult result;
  // calculate discounts
  // add discount

  // if cart lines is empty, return result with no discounts and strategy equal first
  if (input.cart.lines.empty()) {
    result.discountApplicationStrategy = DiscountApplicationStrategy::FIRST;
    return result;
  }

  // define empty targets array
  std::vector<Target> targets;

  // for line in cart.lines if line.quantity is greater than 2 add to targets
  for (auto& line : input.cart.lines) {
    if (line.quantity > 2) {
      Target target;
      target.productVariant = ProductVariant{line.merchandise.id.value_or(""), line.quantity};
      targets.push_back(target);
    }
  }


  // if targets is empty, return result with no discounts and strategy equal first
  if (targets.empty()) {
    result.discountApplicationStrategy = DiscountApplicationStrategy::FIRST;
    return result;
  }


  // return result with a discount containing targets and value equal to percentage of 10
  result.discounts.push_back(Discount{
    Value{std::nullopt, Percentage{10.0}},
    targets,
    input.cart.attribute.value,
    std::nullopt
  });

  return result;
}

int main()
{
  std::string line;
  std::getline(std::cin, line);

  // parse function input
  JS::ParseContext context(line);
  Input input;
  context.parseTo(input);

  // call function
  FunctionResult result = function(input);

  // output json result
  std::string result_json = JS::serializeStruct(result, JS::SerializerOptions(JS::SerializerOptions::Compact));
  std::cout << result_json << std::endl;

  return 0;
}