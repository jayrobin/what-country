get '/' do
  erb :index
end

post '/pin/new' do
  @pin = Pin.new(params)
  if @pin.valid?
    @pin.save!
    content_type :json
    Pin.all_to_json
  end
end

get '/all' do
  @pins = Pin.all
  erb :index
end
