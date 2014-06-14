get '/' do
  dict = Dictionary.load
  @data = dict.data
  erb :index
end

get '/words.json' do
  dict = Dictionary.load
  content_type :json
  Oj.dump(dict.data.to_a.map {|e| Hash['word', e[0], 'definition', e[1]] })
end
