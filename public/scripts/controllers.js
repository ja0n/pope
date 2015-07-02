;(function() {
	'use strict';
	angular.module('app.controllers', [])
	.controller('AppCtrl', function($scope, $location, $http, logger, auth) {
		$scope.auth = auth;
		$scope.main = {
			brand: 'POPE',
			description: 'Platform for Online Problems and Exercises'
		}
		$scope.indexChar = function (index) {
	    return String.fromCharCode(65 + index);
		};
		$scope.isSpecificPage = function() {
			var path;
			return path = $location.path(), _.contains(['/404', '/pages/500', '/login', '/pages/signin', '/pages/signin1', '/pages/signin2', '/pages/signup', '/pages/signup1', '/pages/signup2'], path)
		}
		$scope.submitLogin = function(user) {
			if(user.email && user.password) {
				auth.login(user, function(status) {
					if(status.err) {
						logger.logWarning(status.msg);
					} else if(status.data) {
						logger.logSuccess(status.msg);
						$location.path('/dashboard');
					}
				});
			} else logger.logWarning('Precisa preencher os campos.')
		}

		$scope.logout = function() {
			auth.logout(function(status) {
				if(status.err) {
					logger.logDanger(status.msg);
				} else {
					logger.logSuccess(status.msg)
					$location.path('/login')
				}
			});
		}

		$scope.deleteById = function (path, list, index, id) {
			var url = 'http://' + location.hostname + ':3000/api/' + path + '/' + id;
			$http.delete(url).success(function(data) {
				list.splice(index, 1);
				logger.logSuccess('Operação realizada com sucesso.');
			}).error(function(data) {
				logger.logWarning('Ocorreu algum problema.');
			});
		};
		return $scope.auth = auth, $scope.deleteById
	})
	.controller('CreateQuizCtrl', function($scope, $http, $location, $modal, logger) {
		var original;

		$scope.quizz = {
			name: '',
			description: 'show',
			questions: [{ title: 'Questão 1', description: 'Insira o enunciado aqui', alternatives: [], answer: null, disabled: false }]
		};

		$scope.addQuestion = function() {
			$scope.quizz.questions.push({ title: 'Questão ' + ($scope.quizz.questions.length+1),
													description: 'Insira o enunciado aqui',
													alternatives: [],
													active: true })
		};

		$scope.addAlt = function(alternatives, scope) {
			var newAlt = scope.newAlt.trim();
			0 !== newAlt.length ? (alternatives.push({ description: newAlt, correct: !1 }),
			logger.logSuccess('Alternativa adicionada'), scope.newAlt = '') : void 0
		}
		$scope.edit = function(task) {
			return $scope.editedTask = task
		}
		$scope.doneEditing = function(alt, index, e) {
			$scope.editedTask = null;
			alt.description = alt.description.trim();
			alt.description ? logger.log('Alternativa atualizada') : $scope.remove(alt)
		}
		$scope.remove = function(task, tasks) {
			var index = tasks.indexOf(task);
			tasks.splice(index, 1);
			logger.logError('Alternativa removida');
		}
		$scope.clearCompleted = function() {
			return $scope.tasks = tasks = tasks.filter(function(val) {
				return !val.correct
			})
		}
		$scope.markAll = function(correct) {
			return tasks.forEach(function(task) {
				return task.correct = correct
			}), $scope.remainingCount = correct ? 0 : tasks.length, correct ? logger.logSuccess('Congrats! All done :)') : void 0
		}

		$scope.showInfoOnSubmit = !1, original = angular.copy($scope.quizz);

		$scope.revert = function() {
			return $scope.quizz = angular.copy(original)
		}
		$scope.canRevert = function() {
			return !angular.equals($scope.quizz, original)
		}
		$scope.canSubmit = function() {
			return !angular.equals($scope.quizz, original)
		}
		$scope.submitForm = function() {
			var url = 'http://' + location.hostname + ':3000/api/quizzes';
	    $http.post(url, $scope.quizz).success(function(data) {
	      $location.path('/quizzes');
	    	$scope.revert()
	      return logger.logSuccess('Operação realizada com sucesso.');

	    }).error(function(data) {
	      logger.logError('Ocorreu algum problema.');
	    });
		}
	})
	.controller('AnswerQuizCtrl', function($scope, $http, $routeParams, $location, $modal, logger) {
		var id = $routeParams.id; $scope.answers = [];
		var original;

		var url = 'http://' + location.hostname + ':3000/api/quizzes/' + id;
		$http.get(url).success(function(data) {
			if(data.err) {
				logger.logWarning('Ocorreu algum problema.');
				$location.path('/quizzes');
			}
			$scope.quizz = data;
			$scope.answers = new Array(data.questions.length);
			for (var i = 0; i < $scope.answers.length; i++) $scope.answers[i] = null;

			$scope.showInfoOnSubmit = !1, original = angular.copy($scope.quizz);
		}).error(function(data) {
			logger.logWarning('Ocorreu algum problema.');
			$location.path('/quizzes');
		});

		$scope.showInfoOnSubmit = !1, original = angular.copy($scope.quizz);

		$scope.revert = function() {
			return $scope.quizz = angular.copy(original)
		}
		$scope.canRevert = function() {
			return !angular.equals($scope.quizz, original)
		}
		$scope.canSubmit = function() {
			return $scope.answers.indexOf(null) == -1
		}
		$scope.submitForm = function() {
	    $http.post(url, { submission: $scope.answers}).success(function(data) {
	      $location.path('/quizzes');
	    	$scope.revert()
	      return logger.logSuccess('Operação realizada com sucesso.');

	    }).error(function(data) {
	      logger.logError('Ocorreu algum problema.');
	    });
		}
	})
	.controller('SubmissionsQuizCtrl', function($scope, $http, $routeParams, $location, $modal, logger) {
		var id = $routeParams.id; $scope.answers = [];
		var original;

		var url = 'http://' + location.hostname + ':3000/api/quizzes/' + id;
		$http.get(url).success(function(data) {
			if(data.err) {
				logger.logWarning('Ocorreu algum problema.');
				$location.path('/quizzes');
			}
			$scope.quizz = data;
		}).error(function(data) {
			logger.logWarning('Ocorreu algum problema.');
			$location.path('/quizzes');
		});

		$scope.openModal = function(submission) {
    var modalInstance;
    modalInstance = $modal.open({
      templateUrl: "submissionModal.html",
      controller: function($scope, $rootScope, $modalInstance, questions) {
        $scope.name = submission.student.name;
        $scope.answers = submission.answers;
				$scope.questions = questions;

        $scope.ok = function() {
          $modalInstance.close();
        };
        $scope.cancel = function() {
          $modalInstance.dismiss("cancel");
        };
				$scope.indexChar = function (index) {
			    return String.fromCharCode(65 + index);
				};
      },
      resolve: {
        questions: function() {
          //return $scope.user.disciplines[discipline_id].schedule;
          return $scope.quizz.questions;
        }
      }
    }), modalInstance.result.then(function(selectedItem) {
      $scope.selected = selectedItem
    }, function() {
      //$log.info("Modal dismissed at: " + new Date)
    })
  };

	})
	.controller('ViewQuizzesCtrl', function($scope, $http, $location, logger) {
		var url = 'http://' + location.hostname + ':3000/api/quizzes';
		$http.get(url).success(function(data) {
			$scope.viewData = data;
		});

	})
	.controller('CreateStudentCtrl', function($scope, $http, $location, logger) {
		var marker;

		var original;
		$scope.client = {
			name: '',
			email: '',
			password: '',
			description: '',
			address: '',
			telephones: '',
			coords: {}
		}
		$scope.showInfoOnSubmit = !1, original = angular.copy($scope.client);
		$scope.revert = function() {
			return $scope.client = angular.copy(original), $scope.client_form.$setPristine()
		}
		$scope.canRevert = function() {
			return !angular.equals($scope.client, original) || !$scope.client_form.$pristine
		}
		$scope.canSubmit = function() {
			return $scope.client_form.$valid && !angular.equals($scope.client, original)
		}
		$scope.submitForm = function() {
			var url = 'http://' + location.hostname + ':3000/api/students';
	    $http.post(url, $scope.client).success(function(data) {
	      if (data.err) return logger.logError('Ocorreu algum problema.');
	      else {
					logger.logSuccess('Operação realizada com sucesso.');
					$location.path('/students');
					$scope.revert();
				}

	    }).error(function(data) {
	      logger.logError('Ocorreu algum problema.');
	    });
		}
	})
	.controller('EditStudentCtrl', function($scope, $http, $routeParams, $location, logger) {
		var id = $routeParams.id;
		var original;

		var url = 'http://' + location.hostname + ':3000/api/students/' + id;
		$http.get(url).success(function(data) {
			if(data.err) {
				logger.logWarning('Ocorreu algum problema.');
				$location.path('/students');
			}
			$scope.client = data;
			$scope.showInfoOnSubmit = !1, original = angular.copy($scope.client);
		}).error(function(data) {
			logger.logWarning('Ocorreu algum problema.');
			$location.path('/students');
		});

		$scope.revert = function() {
			return $scope.client = angular.copy(original), $scope.client_form.$setPristine()
		}
		$scope.canRevert = function() {
			return !angular.equals($scope.client, original) || !$scope.client_form.$pristine
		}
		$scope.canSubmit = function() {
			return $scope.client_form.$valid && !angular.equals($scope.client, original)
		}
		$scope.submitForm = function() {
	    $http.put(url, $scope.client).success(function(data) {
	      if (data.err) return logger.logError('Ocorreu algum problema.');
	      else {
					logger.logSuccess('Operação realizada com sucesso.');
					$location.path('/students');
					$scope.revert();
				}
	    }).error(function(data) {
	      logger.logError('Ocorreu algum problema.');
	    });
		}
	})
	.controller('ViewStudentsCtrl', function($scope, $http, $location, logger) {
		var url = 'http://' + location.hostname + ':3000/api/students';
		$http.get(url).success(function(data) {
			$scope.viewData = data;
		});
	})
	.controller('CreateProfessorCtrl', function($scope, $http, $location, logger) {
		var url = 'http://' + location.hostname + ':3000/api/professors';
		$http.get(url).success(function(data) {
			$scope.selectData = data;
		});
		var original;
		$scope.professor = {
			name: '',
			email: '',
			password: '',
		}
		$scope.showInfoOnSubmit = !1, original = angular.copy($scope.professor);
		$scope.revert = function() {
			return $scope.professor = angular.copy(original), $scope.professor_form.$setPristine()
		}
		$scope.canRevert = function() {
			return !angular.equals($scope.professor, original) || !$scope.professor_form.$pristine
		}
		$scope.canSubmit = function() {
			return $scope.professor_form.$valid && !angular.equals($scope.professor, original)
		}
		$scope.submitForm = function() {
			var url = 'http://' + location.hostname + ':3000/api/professors';
	    $http.post(url, $scope.professor).success(function(data) {
	      $location.path('/professors');
	    	$scope.revert()
	      return logger.logSuccess('Operação realizada com sucesso.');

	    }).error(function(data) {
	      logger.logError('Ocorreu algum problema.');
	    });
		}
	})
	.controller('EditProfessorCtrl', function($scope, $http, $routeParams, $location, logger) {
		var id = $routeParams.id;
		var original;

		var url = 'http://' + location.hostname + ':3000/api/professors/' + id;
		$http.get(url).success(function(data) {
			if(data.err) {
				logger.logWarning('Ocorreu algum problema.');
				$location.path('/professors');
			}
			$scope.professor = data;
			$scope.showInfoOnSubmit = !1, original = angular.copy($scope.professor);
		}).error(function(data) {
			logger.logWarning('Ocorreu algum problema.');
			$location.path('/professors');
		});

		$scope.revert = function() {
			return $scope.professor = angular.copy(original), $scope.professor_form.$setPristine()
		}
		$scope.canRevert = function() {
			return !angular.equals($scope.professor, original) || !$scope.professor_form.$pristine
		}
		$scope.canSubmit = function() {
			return $scope.professor_form.$valid && !angular.equals($scope.professor, original)
		}
		$scope.submitForm = function() {
	    $http.put(url, $scope.professor).success(function(data) {
	      if (data.err) return logger.logError('Ocorreu algum problema.');
	      else {
					logger.logSuccess('Operação realizada com sucesso.');
					$location.path('/professors');
					$scope.revert();
				}
	    }).error(function(data) {
	      logger.logError('Ocorreu algum problema.');
	    });
		}
	})
	.controller('ViewProfessorsCtrl', function($scope, $http, $location, logger) {
		var url = 'http://' + location.hostname + ':3000/api/professors';
		$http.get(url).success(function(data) {
			$scope.viewData = data;
		});
	})
	.controller('NavCtrl', function($scope, filterFilter) {
		return null;
	})
	.controller('DashboardCtrl', ['$scope', function($scope) {
		return $scope.comboChartData = [
			['Month', 'Bolivia', 'Ecuador', 'Madagascar', 'Papua New Guinea', 'Rwanda', 'Average'],
			['2014/05', 165, 938, 522, 998, 450, 614.6],
			['2014/06', 135, 1120, 599, 1268, 288, 682],
			['2014/07', 157, 1167, 587, 807, 397, 623],
			['2014/08', 139, 1110, 615, 968, 215, 609.4],
			['2014/09', 136, 691, 629, 1026, 366, 569.6]
		], $scope.salesData = [
			['Year', 'Sales', 'Expenses'],
			['2010', 1e3, 400],
			['2011', 1170, 460],
			['2012', 660, 1120],
			['2013', 1030, 540]
		]
	}])
}).call(this)
