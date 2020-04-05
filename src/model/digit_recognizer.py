# -*- coding: utf-8 -*-
"""
@author: Parker Hutchinson

Some inspiration from:
https://www.kaggle.com/yassineghouzam/introduction-to-cnn-keras-0-997-top-6
and 
https://www.sitepoint.com/keras-digit-recognition-tutorial/
"""

import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt

# Set random seeds to ensure consistency
np.random.seed(1)
tf.random.set_seed(1) 

""" LOAD DATA """
mnist = tf.keras.datasets.mnist
(x_train, y_train), (x_test, y_test) = mnist.load_data()

"""
# Display sample input
plt.imshow(x_train[0], cmap='gray')
plt.show()
"""

""" DATA PREPROCESSING """
x_train = tf.keras.utils.normalize(x_train, axis=1)
x_test = tf.keras.utils.normalize(x_test, axis=1)

""" MODEL CREATION """

# Hyperparemeters
hidden_layer_size = 128
output_size = 10
num_epochs=10
early_stopper = tf.keras.callbacks.EarlyStopping(monitor='accuracy', 
                                                 mode='max', patience=2)

model = tf.keras.Sequential([
    tf.keras.layers.Flatten(input_shape = (28, 28)),
    tf.keras.layers.Dense(hidden_layer_size, activation='relu'),
    tf.keras.layers.Dense(hidden_layer_size, activation='relu'),
    tf.keras.layers.Dense(output_size, activation='softmax')
    ])

model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', 
              metrics=['accuracy'])

model.fit(x=x_train, y=y_train, epochs=num_epochs, callbacks=[early_stopper])

""" MODEL EVALUATION """
test_loss, test_acc = model.evaluate(x_test, y_test)
print('Test set Loss: {0} \tAccuracy: {1:.2f}%'.format(test_loss, test_acc*100))

from random import random

def print_predictions(predictions, verbose=1):
    """
    Summarizes the model's list of predictions in a way determined by the 
    specified verbosity.
    
    Parameters
    ----------
    predictions : list
        A list where each value represents the model's confidence that the
        digit equal to the index where the value is located was in the input.
    verbose : int, optional
        Controls how much information about the descriptions to display. 
        If the value is 1, the output will only include the prediction that the 
        model was most confident in. If the value is 2, all predictions and 
        their respective confidence levels will be displayed in the output.
        The default is 1.
    """
    prediction_digit = np.argmax(predictions)
    confidence_percentage = np.max(predictions) * 100
    print('Prediction: {0} with {1:.2f}% confidence'.format(prediction_digit, 
                                                        confidence_percentage))
    
    if (verbose == 2):
        print('Digit:\t Confidence')
        for digit, confidence in enumerate(predictions[0]):
            print('{0}:\t {1:.2f}'.format(digit, confidence*100))
    
    
def test_model_descriptive(test_input, verbose=1, actual=None):
    """
    Plots a single input, evaluates the model on it, and describes the model's
    predictions.
    
    Parameters
    ----------
    test_input : numpy.ndarray
        An input image of shape (28, 28)containing a handwritten digit. The 
        image should be in grayscale and normalized before being passed as a 
        parameter.
    verbose : int, optional
        Controls how much information is displayed when the model predictions
        are summarized. The default is 1.
    actual : int, optional
        The actual digit that was written. The default is None.
    """
    # Plot the input image
    plt.imshow(test_input, cmap='gray')
    plt.show()
    
    # Calculate and display predictions
    predictions = model.predict(test_input.reshape(1, 28, 28))
    print_predictions(predictions, verbose)
    
    # If a correct answer is provided, display it
    if actual is not None:
        print('Actual digit:', actual)
        


def test_model_on_random():
    """
    Tests the model on a random input from the test set.
    """
    input_index = int(random()*len(x_test))
    test_model_descriptive(x_test[input_index], actual=y_test[input_index])
    

test_model_on_random()
prompt = 'Press enter to see more model predictions on random test examples,' \
    ' or q to quit'
answer = input(prompt)
while answer.lower() != 'q':
    test_model_on_random()
    answer = input(prompt)
    
""" CUSTOM IMAGE INPUT """
import imageio

def get_image(filename):
    """
    Retrieves an image from the given filename and processes it so it can be
    passed to the model.

    Parameters
    ----------
    filename : str
        The path to the file containing an image of a handwritten digit.

    Returns
    -------
    normalized_image : numpy.ndarray
        A Numpy array with values representing the grayscale values of the 
        original image.

    """
    im = imageio.imread(filename) 
    
    grayscale_image = np.dot(im[...,:3], [0.299, 0.587, 0.114])
    
    """
    The input should be a white digit on a black background. By default, lower
    values in the image indicate darkness (255 is white), so if the average 
    value of the image is greater than 255 / 2 (most of the image contains 
    white), invert the image colors.
    """
    if np.average(grayscale_image) > 255 / 2:
        grayscale_image = abs(grayscale_image - 255)
    
    normalized_image = tf.keras.utils.normalize(grayscale_image, axis=1)
    
    return normalized_image

test_model_descriptive(get_image("https://i.imgur.com/a3Rql9C.png"))
