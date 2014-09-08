def get_random_pos
	{x: rand(-180..180), y: rand(-85..85)}
end

Question.delete_all

Question.create(content: "What country has the best food?")
Question.create(content: "What country has the best beer?")
Question.create(content: "What country has the ugliest people?")
Question.create(content: "What country has the worst tourists?")

# User.delete_all
# (1..100).each do |i|
# 	User.create(username: i)
# end

# Pin.delete_all

# User.all.each do |user|
# 	Question.all.each do |question|
# 		pin = question.pins.create(get_random_pos)
# 		user.pins << pin
# 	end
# end