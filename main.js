(function(){

  window.App = {
  	Models: {},  	
  	Views: {},
  	Collections: {}
  };

  window.template = function(id) {
		return _.template( $('#' + id).html() );
	};

	/******************
	*
	*  Models
	*
	*******************/

	App.Models.Task = Backbone.Model.extend({
		defaults: {
			title: '',
		  priority: 0,
		  completed: false
	  }		
	});

	/******************
	*
	*  Views
	*
	*******************/

	App.Views.AddTask = Backbone.View.extend({

  	el: '#addTask',

  	events: {
  		'submit': 'submit'
  	},  	

  	submit: function(e) {
  		e.preventDefault();
  		var newTaskTitle = $(e.currentTarget).find('input[type=text]').val();
  		$(e.currentTarget).find('input[type=text]').val('');
  		var task = new App.Models.Task({ title: newTaskTitle });
  		this.collection.add(task);  		
  	},

  });

	App.Views.Tasks = Backbone.View.extend({

		tagName: 'ul',

		initialize: function() {
			this.collection.on('add', this.addOne, this);
		},

		render: function() {
  		this.collection.each(this.addOne, this);  		
  		return this;
  	},

  	addOne: function(task) {
  		// create a new child view
  		var taskView = new App.Views.Task({ model: task });
  		// append to the root ul element  		
  		this.$el.append(taskView.render().el);  		
  	}

	});

	App.Views.Task = Backbone.View.extend({

		tagName: 'li',

		template: template('taskTemplate'),

		initialize: function() {
	    this.listenTo(this.model, "change", this.render);
	  }

		events: {
			"dblclick span": "edit",
			'keypress .editInput': 'updateOnEnter',
			'focusout .editInput': 'close'
		},

		edit: function() {
			this.$el.addClass('editing');
			this.$el.find('input').val(this.model.toJSON().title);
			this.$el.find('input').focus();
			console.log(this.model.toJSON());
		},

		updateOnEnter: function(e) {
			if (e.which === 13) {
				this.close();
			}
		},

		close: function() {
			var value = this.$input.val();
			console.log(value);
			var trimmedValue = value.trim();
			
			if (!this.$el.hasClass('editing')) {
				return;
			}

			if (trimmedValue) {
				this.model.set({ 'title': trimmedValue });	
			} else {
				this.clear();
			}

			this.$el.removeClass('editing');

			this.render();
		},

		render: function() {
			var template =  this.template( this.model.toJSON() );
			this.$el.html( template );
			this.$input = this.$('.editInput');	
			return this;
		}, 

	});

	/******************
	*
	*  Collections
	*
	*******************/

	App.Collections.Tasks = Backbone.Firebase.Collection.extend({
	  url: 'https://myfirsttodo.firebaseio.com/todos',	  
	  model: App.Models.Task 
	});

	/******************
	*
	*  Init
	*
	*******************/

	window.taskCollection = new App.Collections.Tasks;
	// window.taskCollection.create([
	// 	{
	// 		title: "Task 1",
	// 		priority: 2
	// 	},
	// 	{
	// 		title: "Task 2",
	// 		priority: 3
	// 	},
	// 	{
	// 		title: "Another Task",
	// 		priority: 5
	// 	}
	// ]);
	window.taskCollection.fetch();

	window.tasksView = new App.Views.Tasks({
		collection: taskCollection
	});

	var addTaskView = new App.Views.AddTask({ collection: taskCollection });

	$('.tasks').append(tasksView.render().el);
		

})();