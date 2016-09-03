Warden::Manager.after_set_user except: :fetch do |user, auth, opts|
  puts user.update({ room: user.id.to_i, invite: user.id.to_i})  # RESET USER.ROOM AND USER.INVITE TO USER.ID
end