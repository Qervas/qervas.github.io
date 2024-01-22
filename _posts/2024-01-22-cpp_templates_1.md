---
layout: post
title:  C++ templates (1)
date: 2023-01-22 17:02:00
description: Parameter packs
tags: C++
categories: Tech
thumbnail: assets/img/concept/cpp.png
---
# Parameter Packs 1

```c++
template<typename... Ts>
constexpr auto get_type_sizes(){
	return std::array<std::size_t, 	sizeof...(Ts)>{sizeof(Ts)...};
}

auto sizes = get_type_sizes<short, int, long, long long>();
```

* What's the `sizeof` going on here?
  * > `sizeof…(Ts)` evaluates how many arguments in the parameter packs, 4 in this case.
    >
  * > `sizeof(Ts)...`expands into a comma-seperated sequence as `sizeof(short), sizeof(int), sizeof(long), sizeof(long long)`, a number sequence.
    >



```c++
template <typename... Ts, typename... Us>
constexpr auto multipacks(Ts... args1, Us... args2)
{
	std::cout << sizeof...(args1) << ',' << sizeof...(args2) << '\n';
}

multipacks<int>(1, 2, 3, 4, 5, 6);// 1,5
multipacks<int, int, int>(1, 2, 3, 4, 5, 6);// 3,3
multipacks<int, int, int, int>(1, 2, 3, 4, 5, 6);// 4,2
multipacks<int, int, int, int, int, int>(1, 2, 3, 4, 5, 6); // 6,0
```

* A parameter pack can be followed by other parameters including more parameter packs. First group of function parameters match template parameters one by one as `Ts... args1`, the remainings are `Us... args2`.


```c++
#include<iostream>
#include<functional>
template<typename, typename>
struct func_pair;

template<typename R1, typename... A1, typename R2, typename... A2>
struct func_pair<R1(A1...), R2(A2...)>{
	std::function<R1(A1...)> f;
	std::function<R2(A2...)> g;
};

bool twice_as(int a, int b){
	return a >= b*2;
}
double sum_and_div(int a, int b, double c){
	return (a + b) / c;
}
int main(){
	func_pair<bool(int, int), double(int, int, double)> funcs{twice_as, sum_and_div };
	funcs.f(42, 12);
	funcs.g(42, 12, 10.0);
	return 0;
}
```

* a class template that represents a pair of function pointers.

## Reference

[Template Metaprogramming with C++](https://www.amazon.com/Template-Metaprogramming-everything-templates-metaprogramming-ebook/dp/B09ZHZFTKV): Learn everything about C++ templates and unlock the power of template metaprogramming - by [Marius Bancila](https://www.amazon.com/Marius-Bancila/e/B07D8WMX23/ref=dp_byline_cont_ebooks_1) **(Author)**
