'use strict'
var test = require('tap').test
var path = require('path')
var common = require('../common-tap.js')
var rimraf = require('rimraf')
var mkdirp = require('mkdirp')
var basepath = path.resolve(__dirname, path.basename(__filename, '.js'))
var fixturepath = path.resolve(basepath, 'npm-test-files')
var targetpath = path.resolve(basepath, 'target')
var Tacks = require('tacks')
var File = Tacks.File
var Dir = Tacks.Dir

test('ls without arg', function (t) {
  var fixture = new Tacks(
    Dir({
      'npm-test-ls': Dir({
        'package.json': File({
          name: 'npm-test-ls',
          version: '1.0.0',
          dependencies: {
            'dep': 'file:../dep'
          }
        })
      }),
      'dep': Dir({
        'package.json': File({
          name: 'dep',
          version: '1.0.0'
        })
      })
    })
  )
  fixture.create(fixturepath)
  common.npm([
    'install'
  ], {
    cwd: path.join(fixturepath, 'npm-test-ls')
  }, function (err, code) {
    t.ifErr(err, 'install succeeded')
    t.equal(0, code, 'exit 0 on install')
    common.npm([
      'ls', '--json'
    ], {
      cwd: path.join(fixturepath, 'npm-test-ls')
    }, function (err, code, stdout, stderr) {
      t.ifErr(err, 'ls succeeded')
      t.equal(0, code, 'exit 0 on ls')
      var pkg = JSON.parse(stdout)
      var deps = pkg.dependencies
      t.ok(deps.dep, 'dep present')
      fixture.remove(fixturepath)
      t.done()
    })
  })
})

test('ls with filter arg', function (t) {
  var fixture = new Tacks(
    Dir({
      'npm-test-ls': Dir({
        'package.json': File({
          name: 'npm-test-ls',
          version: '1.0.0',
          dependencies: {
            'dep': 'file:../dep'
          }
        })
      }),
      'dep': Dir({
        'package.json': File({
          name: 'dep',
          version: '1.0.0'
        })
      }),
      'otherdep': Dir({
        'package.json': File({
          name: 'otherdep',
          version: '1.0.0'
        })
      })
    })
  )
  fixture.create(fixturepath)
  common.npm([
    'install'
  ], {
    cwd: path.join(fixturepath, 'npm-test-ls')
  }, function (err, code) {
    t.ifErr(err, 'install succeeded')
    t.equal(0, code, 'exit 0 on install')
    common.npm([
      'ls', 'dep',
      '--json'
    ], {
      cwd: path.join(fixturepath, 'npm-test-ls')
    }, function (err, code, stdout, stderr) {
      t.ifErr(err, 'ls succeeded')
      t.equal(0, code, 'exit 0 on ls')
      var pkg = JSON.parse(stdout)
      var deps = pkg.dependencies
      t.ok(deps.dep, 'dep present')
      t.notOk(deps.otherdep, 'other dep not present')
      fixture.remove(fixturepath)
      t.done()
    })
  })
})

test('ls with missing filtered arg', function (t) {
  var fixture = new Tacks(
    Dir({
      'npm-test-ls': Dir({
        'package.json': File({
          name: 'npm-test-ls',
          version: '1.0.0',
          dependencies: {
            'dep': 'file:../dep'
          }
        })
      }),
      'dep': Dir({
        'package.json': File({
          name: 'dep',
          version: '1.0.0'
        })
      })
    })
  )
  fixture.create(fixturepath)
  common.npm([
    'install'
  ], {
    cwd: path.join(fixturepath, 'npm-test-ls')
  }, function (err, code) {
    t.ifErr(err, 'install succeeded')
    t.equal(0, code, 'exit 0 on install')
    common.npm([
      'ls', 'notadep',
      '--json'
    ], {
      cwd: path.join(fixturepath, 'npm-test-ls')
    }, function (err, code, stdout, stderr) {
      t.ifErr(err, 'ls succeeded')
      t.equal(1, code, 'exit 1 on ls')
      var pkg = JSON.parse(stdout)
      var deps = pkg.dependencies
      t.notOk(deps, 'deps missing')
      fixture.remove(fixturepath)
      t.done()
    })
  })
})

test('cleanup', function (t) {
  rimraf.sync(basepath)
  t.done()
})
