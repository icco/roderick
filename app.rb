PER_PAGE = 100

get '/' do
  dict = Dictionary.load
  @data = dict.data
  erb :index
end

get '/words.json' do
  dict = Dictionary.load
  content_type :json
  Oj.dump(dict.to_a)
end

get '/words/:page.json' do
  page = params["page"].to_i
  if page < 1
    redirect to('/words/1.json')
  end

  dict = Dictionary.load
  start = (page - 1) * PER_PAGE
  finish = page * PER_PAGE

  content_type :json
  Oj.dump(dict.to_a[start..finish])
end
