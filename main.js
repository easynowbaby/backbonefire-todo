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

	App.Views.Tasks = Backbone.View.extend({

		el: $('#app'),

		initialize: function() {
			this.collection.on('add', this.addOne, this);			
			this.list = this.$(".tasks");
		},

		hello: function() {
			console.log('hello')
		},

		render: function() {
  		this.collection.each(this.addOne, this);  		
  		return this;
  	},

  	rerender: function() {
  		this.list.empty();
  		this.collection.each(this.addOne, this);  		
  		return this;
  	},

  	addOne: function(task) {
  		// create a new child view
  		var taskView = new App.Views.Task({ model: task });  		
  		// append to the root ul element  		
  		this.list.append(taskView.render().el);  		
  	},

  	events: {
  		'click #addTask': 'submit',
  		'click .delete': 'delete' 		
  	},  

  	delete: function(e) {
  		var taskTitle = $(e.target).siblings('span').html();
  		this.collection.remove(this.collection.where({title: taskTitle}));  		
  		this.rerender();
		},	

  	submit: function(e) {
  		console.log('click');
  		var newTaskTitle = $('#addTaskInput').val();
  		$('#addTaskInput').val('');  		
  		this.collection.create({ title: newTaskTitle });
  	},

	});

	App.Views.Task = Backbone.View.extend({

		tagName: 'li',

		template: template('taskTemplate'),

		initialize: function() {
	    this.listenTo(this.model, "change", this.render);
	  },

	  render: function() {
			var template =  this.template( this.model.toJSON() );
			this.$el.html( template );
			this.$input = this.$('.editInput');	
			return this;
		},

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
	window.taskCollection.fetch();
	window.tasksView = new App.Views.Tasks({
		collection: taskCollection
	});
		

})();