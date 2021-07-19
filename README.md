# Museum: the humidity rate

## Summary
[- Introduction](#introduction): brief introduction to the problem  
[- Architecture](#architecture): architecture of the idea  
[- Project structure](#project-structure): how the project is organized  
[- Getting started](#getting-started): guide to run the project  

## Introduction
This is a project for the exam of Serverless Computing for IoT.

The idea is to **simulate an humidity sensor** placed in a museum to manage the humidity rate in order to **preserve the works of art**.  
The humidity rate should be **between 30% and 50%** so when it exceeds 50% a **dehumidifier is activated** and when it arrives at 30% the **dehumidifier is deactivated**.  

All the values are **simulated** because I am not in possession of any Iot devices.

## Architecture
To simulate the sending values of the humidity sensor there is the function ***'sendhumidity'*** on Nuclio.  
The data are stored in **Redis**, an open source in-memory data structure store, in which there are:
- **humidity**: integer value of the humidity rate 
- **order**: "ascending" or "descending" indicates if the humidity value has to increase or decrease

As said the humidity rate should be **between 30% and 50%** so the ***'sendhumidity'*** function retrieves the humidity value from Redis and checks:
- if order is "ascending" increases the humidity value of 2 (+2)
- if order is "descending" decreases the humidity value of 2 (-2)
- if humidity value is <= 30 sets the order "ascending"

And then the humidity value is published every 10 seconds in the queue ***'iot/sensors/humidity'*** of **RabbitMQ**.  

When a value is published in this queue, the function ***'consumehumidity'*** on Nuclio is triggered, which processes this value. This function publishes a new message in the queue ***'iot/logs'*** (also a message warning the dehumidifier is deactivated if the humidity value is <= 30) and checks if the humidity value is >= 50 publishes it in the queue ***'iot/alerts'***.

When a value is published in the 'iot/alerts' queue, the function ***'changehumidity'*** on Nuclio is triggered, sets the value order "descending" in Redis and publishes a message in the queue ***'iot/logs'*** warning the dehumidifier is activated so the humidity value should decrease.

## Project Structure

## Getting Started
> Museum requires [Node.js](https://nodejs.org/en/) and [Docker](https://www.docker.com/products/docker-desktop) to run.

From **different** terminals, start the docker to run RabbitMQ and Nuclio with these following commands:  
- **Docker RabbitMQ**:
  ```sh
  docker run -p 9000:15672  -p 1883:1883 -p 5672:5672  cyrilix/rabbitmq-mqtt
  ```
- **Docker Nuclio**:
  ```sh
  docker run -p 8070:8070 -v /var/run/docker.sock:/var/run/docker.sock -v /tmp:/tmp nuclio/dashboard:stable-amd64
  ```
- **Docker Redis**:
  ```sh
  docker run -p 6379:6379 -d redis
  ```
- **Update and deploy Functions**:

  - Type '**localhost:8070**' on your browser to open the homepage of Nuclio;
  - Create new project and call it 'Museum';
  - Press '**Create function**', '**Import**' and upload the three functions that are in the **yaml_functions** folder;
  - In both, **change the already present IP with your IP**;\
    **!!!Don't forget the trigger!!!**
  - Press **'Deploy'**.
- **Start Logger**:  

  Open the terminal and type, from the **root of the project**:
  ```sh
  node logger.js
  ```
