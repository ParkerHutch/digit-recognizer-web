from flask import Flask, render_template
from flask_bootstrap import Bootstrap
from flask_moment import Moment

from datetime import datetime
from digit_recognizer import DigitRecognizer

app = Flask(__name__)

bootstrap = Bootstrap(app)
moment = Moment(app)


@app.route('/')
def index():
    DigitRecognizer.get_model()
    return render_template('index.html', current_time=datetime.utcnow())


@app.route('/user/<name>')
def user(name):
    return render_template('user.html', name=name)

# Custom error pages
# Error handlers return a response and also need to return a
# numeric status code that corresponds to the error


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500


app.run(debug=True)
