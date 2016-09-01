class AddInviteToUsers < ActiveRecord::Migration
  def change
  	add_column :users, :invite, :integer
  end
end
