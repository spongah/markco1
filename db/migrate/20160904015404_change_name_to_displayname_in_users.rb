class ChangeNameToDisplaynameInUsers < ActiveRecord::Migration
  def change
  	remove_column :users, :name
  	add_column :users, :displayname, :string
  end
end
