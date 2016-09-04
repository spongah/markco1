class AddDeclinedAndRemovedToUsers < ActiveRecord::Migration
  def change
  	add_column :users, :declined, :integer
  	add_column :users, :removed, :integer
  end
end
