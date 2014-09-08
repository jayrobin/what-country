def get_random_pos
	{x: rand(-180..180), y: rand(-85..85)}
end

Question.delete_all

Question.create(content: "What country has the best food?")
Question.create(content: "What country has the best beer?")
Question.create(content: "What country has the ugliest people?")
Question.create(content: "What country has the worst tourists?")

# Question ideas

# sports
	# What country is the best at sports?
	# What country is the best at soccer?
	# What country is the best at sports?

# food/drink
	# What country has the best food?
	# What country has the worst food?
	# What country has the best beer?
	# What country drinks the most alcohol?

# people
	# What country has the worst tourists?
	# What country has the most attractive people?
	# What country has the best accent?
	# What country has the worst accent?
	# What country has the friendliest people?

# places
	# What country has the best beaches?
	# What country has the best scenery?

# misc
	# What country smells the worst?
	# What country would win in a free-for-all?
	# What country has the best education?
	# What country will be the world leader in fifty years?
	# What country has the worst drivers?
	# What country is most responsible for all the world's problems?

# personal
	# What country would you most like to live in?
	# What country would you send your worst enemy to live out their last days?
	# What country did you last visit?

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