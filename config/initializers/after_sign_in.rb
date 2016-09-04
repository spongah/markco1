Warden::Manager.after_set_user except: :fetch do |user, auth, opts|
  user.update({ room: user.id.to_i, invite: user.id.to_i, tracking: true })  # RESET USER.ROOM AND USER.INVITE TO USER.ID
end