require 'bundler/setup'
Bundler.require(:default)

require 'lib/dictionary'

get '/' do
  dict = Dictionary.load
  @data = dict.data
  erb 'index'
end
