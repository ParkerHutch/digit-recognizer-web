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
import random
random.seed(1)
np.random.seed(1)
tf.random.set_seed(1) 

""" LOAD DATA """
mnist = tf.keras.datasets.mnist
(x_train, y_train), (x_test, y_test) = mnist.load_data()

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

""" SAVE MODEL """
# Guide at: https://www.tensorflow.org/tutorials/keras/save_and_load
model.save('saved_model') 

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
