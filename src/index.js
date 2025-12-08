#!/usr/bin/env node
import { Command } from 'commander'
import pkg from '../package.json' with { type: 'json' }
import registerCommitCommand from './commands/commit.js'
import { registerConfigCommand } from './commands/config.js'

const program = new Command()

program.name('ai').version(pkg.version).description('AI commit')

registerConfigCommand(program)
registerCommitCommand(program)

program.parse()
