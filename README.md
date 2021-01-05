# DIA

A library to generate in batch diagram sequence using websequencediagrams

## Prerequisites

* NodeJS[node](https://nodejs.org)

## Installation

```
$ npm install
```

## Get Started

To firt test, you can run:
```
$ ./cli.js generate ../inputExample/input
```

If you want to link this project to your commands shell, you can run:
```
$ npm link
```

After that you can run, like:
```
$ dia generate <input_file> -e png
```


The file will be generate on your current path
Example:
```
$ cd <dia>/inputExample/
```
```
$ dia generate <dia>/inputExample/input -e png
```

## TODO List

- [x] Progress bar
- [ ] Filename output without space


## Contributing

Please feel free to submit issues, fork the repository and send pull requests!

------

##  License

This project is licensed under the terms of the MIT license.
