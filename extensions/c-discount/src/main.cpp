#include <iostream>
#include "json_struct.h"


struct Attribute
{
  std::string value;
  std::string key;
  JS_OBJ(key, value);
};
struct Cart
{
  Attribute attribute;
  JS_OBJ(attribute);
};

struct Input
{
  Cart cart;
  JS_OBJ(cart);
};

// define FixedAmount with optional applies_to_each_item and value of float
struct FixedAmount
{
  bool applies_to_each_item;
  float value;
  JS_OBJ(applies_to_each_item, value);
};

// define Percentage with float value
struct Percentage
{
  float value;
  JS_OBJ(value);
};


// define Value with optional FixedAmount and Percentage
struct Value
{
  std::optional<FixedAmount> fixedAmount;
  std::optional<Percentage> percentage;
  JS_OBJ(fixedAmount, percentage);
};

// define ProductVariant with id and std::optional quantity
struct ProductVariant
{
  std::string id;
  std::optional<int> quantity;
  JS_OBJ(id, quantity);
};

// Define Target to be a ProductVariant or a Value
struct Target
{
  std::optional<ProductVariant> product_variant;
  JS_OBJ(product_variant);
};

JS_ENUM(ConditionTargetType, product_variant)
JS_ENUM_DECLARE_STRING_PARSER(ConditionTargetType)

// define ProductMinimumQuantity with ids and minimum_quantity and target_type
struct ProductMinimumQuantity
{
  std::vector<std::string> ids;
  int minimum_quantity;
  ConditionTargetType target_type;
  JS_OBJ(ids, minimum_quantity, target_type);
};

// define ProductMinimumSubtotal with ids and minimum_amount and target_type
struct ProductMinimumSubtotal
{
  std::vector<std::string> ids;
  float minimum_amount;
  ConditionTargetType target_type;
  JS_OBJ(ids, minimum_amount, target_type);
};

// Define Condition to be a ProductMinimumQuantity or a ProductMinimumSubtotal
struct Condition
{
  std::optional<ProductMinimumQuantity> product_minimum_quantity;
  std::optional<ProductMinimumSubtotal> product_minimum_subtotal;
  JS_OBJ(product_minimum_quantity, product_minimum_subtotal);
};


// define Discount with value and message
struct Discount
{
  Value value;
  std::vector<Target> targets;
  std::string message;
  std::optional<std::vector<Condition>> conditions;

  JS_OBJ(value, message);
};

JS_ENUM(DiscountApplicationStrategy, FIRST, MAXIMUM);
JS_ENUM_DECLARE_STRING_PARSER(DiscountApplicationStrategy);

struct FunctionResult {
  std::vector<Discount> discounts;
  DiscountApplicationStrategy discount_application_strategy;
  JS_OBJ(discounts, discount_application_strategy);
};

FunctionResult function(Input input) {
  FunctionResult result;
  // calculate discounts
  // add discount
  result.discounts.push_back(Discount{
    Value{
      FixedAmount{
        true,
        10.0f
      }
    },
    std::vector<Target>{
      Target{
        ProductVariant{
          "123",
          std::optional<int>{1}
        }
      }
    },
    input.cart.attribute.value,
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