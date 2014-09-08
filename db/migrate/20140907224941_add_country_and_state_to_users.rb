class AddCountryAndStateToUsers < ActiveRecord::Migration
  def change
  	change_table :users do |t|
  		t.string :country
  		t.string :state
  	end
  end
end
