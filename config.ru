require 'bundler/setup'
Bundler.require(:default)

$: << File.dirname(__FILE__) + "/lib"
require 'dictionary'
require 'sass_initializer'

require './app'
run Sinatra::Application
