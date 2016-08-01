new Promise( resolve => {
  if (document.readyState === 'complete') {
    resolve();
  } else {
    window.onload = resolve;
  }
}).then( () => {
  return new Promise( (resolve, reject) => {
  	// Инициализация Open API
    VK.init({
    	apiId: 5569757
  	});
    // Вызов pop-up окна авторизации пользователя
    VK.Auth.login( response => {
      if (response.session) {
        resolve(response);
      } else {
        reject(new Error('Не удалось авторизоваться'));
      }
    }, 2);
  });
}).then( () => {
  return new Promise( (resolve, reject) => {
  	// Вызов метода API
    VK.api('users.get', {fields: ['photo_100']}, response => {
      if (response.error) {
        reject(new Error(response.error.error_msg));
      } else {
        myPhoto.setAttribute('src', response.response[0].photo_100);
        resolve();
      }
    });
  })
}).then( () => {
	return new Promise( (resolve, reject) => {
		VK.api('friends.get', {fields: ['nickname', 'bdate', 'photo_50']}, response => {
			if (response.error) {
				reject(new Error(response.error.error_msg));
			} else {
				resolve(response.response)
			}
		})
	})
}, 
error => alert(error.message)
).then( response => {
	let newDate = new Date(),
			_year = newDate.getFullYear(),
			_month = newDate.getMonth() + 1,
			_day = newDate.getDate();
	response.forEach( person => {
		if(person.bdate) {
			let personDate = person.bdate.split('.'),
					month = parseInt(personDate[1]),
					day = parseInt(personDate[0]); 
			if(month > _month || month == _month && day > _day || day == _day) {
				personDate = new Date(_year, month-1, day)
			} else if(month < _month || month == _month && day < _day) {
				personDate = new Date(_year +1, month-1, day)
			}
			person.daysLeft = Math.ceil((personDate.getTime() - newDate.getTime())/1000/60/60/24);
		}
	});
	response.sort( (a, b) => {
		a = a.daysLeft || 370;
		b = b.daysLeft || 370;
		return a - b;
	});

	let source = document.querySelector('#friendListTemplate').innerHTML,
      template = Handlebars.compile(source),
      friendList = template({friendList: response});
  sortedFriendList.innerHTML = friendList;
},
error => alert(error.message)
);