'use strict'

const Benchmark = require('benchmark')
const SemVer = require('../classes/semver')
const parse = require('../functions/parse')
const compare = require('../functions/compare')
const Range = require('../classes/range')

const suite = new Benchmark.Suite()

// Test cases representing common usage patterns
const simpleVersions = ['1.2.3', '2.0.0', '0.0.1', '10.20.30']
const complexVersions = ['1.2.3-beta.1', '2.0.0-rc.1+build.123', '3.4.5-alpha']
const ranges = ['^1.2.3', '~2.0.0', '>=1.0.0 <2.0.0', '1.x || 2.x']

console.log('='.repeat(80))
console.log('SEMVER OPTIMIZATION BENCHMARKS')
console.log('='.repeat(80))
console.log()

// Benchmark 1: Simple version parsing (most common case)
console.log('Test 1: Simple version parsing (x.y.z format)')
for (const version of simpleVersions) {
  suite.add(`parse("${version}")`, function () {
    parse(version)
  })
}

// Benchmark 2: Complex version parsing
console.log('Test 2: Complex version parsing (with prerelease/build)')
for (const version of complexVersions) {
  suite.add(`parse("${version}")`, function () {
    parse(version)
  })
}

// Benchmark 3: Repeated parsing (cache effectiveness)
console.log('Test 3: Repeated parsing (cache effectiveness)')
suite.add('parse("1.2.3") x 10 (should hit cache)', function () {
  for (let i = 0; i < 10; i++) {
    parse('1.2.3')
  }
})

// Benchmark 4: Version comparison
console.log('Test 4: Version comparison')
suite.add('compare("1.2.3", "1.2.4")', function () {
  compare('1.2.3', '1.2.4')
})

suite.add('compare("1.2.3", "1.2.3")', function () {
  compare('1.2.3', '1.2.3')
})

suite.add('compare("2.0.0", "1.9.9")', function () {
  compare('2.0.0', '1.9.9')
})

// Benchmark 5: SemVer object comparison
console.log('Test 5: SemVer object comparison')
const v1 = new SemVer('1.2.3')
const v2 = new SemVer('1.2.4')
const v3 = new SemVer('1.2.3')

suite.add('semver.compare(other) - different', function () {
  v1.compare(v2)
})

suite.add('semver.compare(other) - equal', function () {
  v1.compare(v3)
})

suite.add('semver.compare(string)', function () {
  v1.compare('1.2.4')
})

// Benchmark 6: Range parsing and testing
console.log('Test 6: Range parsing and testing')
for (const rangeStr of ranges) {
  suite.add(`new Range("${rangeStr}")`, function () {
    new Range(rangeStr)
  })
}

suite.add('range.test("1.2.3") on "^1.2.0"', function () {
  const range = new Range('^1.2.0')
  range.test('1.2.3')
})

// Benchmark 7: Mixed workload
console.log('Test 7: Mixed workload (parse + compare)')
suite.add('Mixed: parse 2 versions and compare', function () {
  const a = parse('1.2.3')
  const b = parse('1.2.4')
  if (a && b) {
    a.compare(b)
  }
})

console.log()
console.log('Running benchmarks...')
console.log('='.repeat(80))
console.log()

suite
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log()
    console.log('='.repeat(80))
    console.log('BENCHMARK COMPLETE')
    console.log('='.repeat(80))
  })
  .run({ async: false })
