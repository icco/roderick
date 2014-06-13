get '/' do
  dict = Dictionary.load
  @data = dict.data
  erb :index
end
