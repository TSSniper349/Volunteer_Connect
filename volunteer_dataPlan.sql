-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 19, 2024 at 05:39 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE volunteer;
USE volunteer;


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `volunteer`
--


-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_firstname` varchar(60) NOT NULL,
  `user_lastname` varchar(60) NOT NULL,
  `user_password` varchar(160) NOT NULL,
  `user_email` varchar(60) NOT NULL,
  `user_phone` int(11) NOT NULL,
  `user_skill` varchar(2000) NULL,
  `user_experience` varchar(2000) NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_email` (`user_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `address`
--

CREATE TABLE `address` (
  `address_id` int(11) NOT NULL AUTO_INCREMENT,
  `number` int(11) NOT NULL,
  `street` varchar(100) NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `postcode` int(11) NOT NULL,
  PRIMARY KEY (`address_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `organisations`
--

CREATE TABLE `organisations` (
  `abn` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `manager_firstname` varchar(60) NOT NULL,
  `manager_lastname` varchar(60) NOT NULL,
  `email` varchar(60) NOT NULL,
  `phone_number` int(11) NOT NULL,
  `password` varchar(160) NOT NULL,
  `description` varchar(2000) NOT NULL,
  `address_id` int(11) NOT NULL,
  PRIMARY KEY (`abn`),
  KEY `address_id` (`address_id`),
  FOREIGN KEY (`address_id`) REFERENCES `address` (`address_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `updates`
--

CREATE TABLE `updates` (
  `update_id` int(11) NOT NULL AUTO_INCREMENT,
  `update_title` varchar(300) NOT NULL,
  `update_date_posted` datetime NOT NULL,
  `update_description` varchar(2000) NOT NULL,
  `isPublic` BIT NOT NULL,
  `abn` int(11) NOT NULL,
  PRIMARY KEY (`update_id`),
  KEY `abn` (`abn`),
  FOREIGN KEY (`abn`) REFERENCES `organisations` (`abn`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `list_of_services`
--

CREATE TABLE `list_of_services` (
  `service_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `emailconsent`
--

CREATE TABLE `emailconsent` (
  `consent_id` int(11) NOT NULL AUTO_INCREMENT,
  `updatesConsent` BIT NOT NULL,
  `eventsConsent` BIT NOT NULL,
  PRIMARY KEY (`consent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `organisation_services`
--

CREATE TABLE `organisation_services` (
  `service_id` int(11) NOT NULL,
  `abn` int(11) NOT NULL,
  PRIMARY KEY (`service_id`,`abn`),
  KEY `abn` (`abn`),
  KEY `service_id` (`service_id`),
  FOREIGN KEY (`abn`) REFERENCES `organisations` (`abn`) ON DELETE CASCADE,
  FOREIGN KEY (`service_id`) REFERENCES `list_of_services` (`service_id`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `members`
--

CREATE TABLE `members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `joined_date` date NOT NULL,
  `user_id` int(11) NOT NULL,
  `abn` int(11) NOT NULL,
  `consent_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `abn` (`abn`),
  KEY `consent_id` (`consent_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`abn`) REFERENCES `organisations` (`abn`) ON DELETE CASCADE,
  FOREIGN KEY (`consent_id`) REFERENCES `emailconsent` (`consent_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `event_id` int(11) NOT NULL AUTO_INCREMENT,
  `event_title` varchar(200) NOT NULL,
  `event_start_date` date NOT NULL,
  `event_end_date` date NOT NULL,
  `event_description` varchar(2000) NOT NULL,
  `abn` int(11) NOT NULL,
  `address_id` int(11) NOT NULL,
  PRIMARY KEY (`event_id`),
  KEY `abn` (`abn`),
  FOREIGN KEY (`abn`) REFERENCES `organisations` (`abn`)  ON DELETE CASCADE,
  KEY `address_id` (`address_id`),
  FOREIGN KEY (`address_id`) REFERENCES `address` (`address_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `events_shift`
--

CREATE TABLE `events_shift` (
  `shift_id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `description` varchar(2000) NULL,
  `event_id` int(11) NOT NULL,
  PRIMARY KEY (`shift_id`),
  KEY `event_id` (`event_id`),
  FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `position_list`
--

CREATE TABLE `position_list` (
  `position_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`position_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `events_position`
--

CREATE TABLE `shift_positions` (
  `position_id` int(11) NOT NULL,
  `shift_id` int(11) NOT NULL,
  `num_people` int(11) NOT NULL,
  PRIMARY KEY (`position_id`, `shift_id`),
  KEY `position_id` (`position_id`),
  KEY `shift_id` (`shift_id`),
  FOREIGN KEY (`position_id`) REFERENCES `position_list` (`position_id`)  ON DELETE CASCADE,
  FOREIGN KEY (`shift_id`) REFERENCES `events_shift` (`shift_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `events_application`
--

CREATE TABLE `events_application` (
  `application_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `position_id` int(11) NOT NULL,
  `shift_id` int(11) NOT NULL,
  PRIMARY KEY (`application_id`),
  KEY `user_id` (`user_id`),
  KEY `position_id` (`position_id`),
  KEY `shift_id` (`shift_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)  ON DELETE CASCADE,
  FOREIGN KEY (`position_id`) REFERENCES `position_list` (`position_id`)  ON DELETE CASCADE,
  FOREIGN KEY (`shift_id`) REFERENCES `events_shift` (`shift_id`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `admin_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(60) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone_number` int(11) NOT NULL,
  `password` varchar(60) NOT NULL,
  PRIMARY KEY (`admin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `application_forms`
--


CREATE TABLE `application_forms` (
  `form_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `abn` int(11) NOT NULL,
  `apply_date` date NOT NULL,
  `answers` varchar(1000) NOT NULL,
  `consent_id` int(11) NOT NULL,
  PRIMARY KEY (`form_id`,`abn`),
  KEY `user_id` (`user_id`),
  KEY `abn` (`abn`),
  KEY `consent_id` (`consent_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`abn`) REFERENCES `organisations` (`abn`) ON DELETE CASCADE,
  FOREIGN KEY (`consent_id`) REFERENCES `emailconsent` (`consent_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE users AUTO_INCREMENT = 1000;
ALTER TABLE application_forms AUTO_INCREMENT = 1000;
ALTER TABLE emailconsent AUTO_INCREMENT = 1000;
ALTER TABLE updates AUTO_INCREMENT = 1000;
ALTER TABLE list_of_services AUTO_INCREMENT = 1000;
ALTER TABLE members AUTO_INCREMENT = 1000;
ALTER TABLE events AUTO_INCREMENT = 1000;
ALTER TABLE events_shift AUTO_INCREMENT = 1000;
ALTER TABLE position_list AUTO_INCREMENT = 1000;
ALTER TABLE events_application AUTO_INCREMENT = 1000;
ALTER TABLE admins AUTO_INCREMENT = 1000;
ALTER TABLE address AUTO_INCREMENT = 1000;

INSERT INTO list_of_services(name) VALUES("Animal Welfare");
INSERT INTO list_of_services(name) VALUES("Arts and Culture");
INSERT INTO list_of_services(name) VALUES("Climate Strategy");
INSERT INTO list_of_services(name) VALUES("Community Services");
INSERT INTO list_of_services(name) VALUES("Disability Services");
INSERT INTO list_of_services(name) VALUES("Drug & Alcohol Services");
INSERT INTO list_of_services(name) VALUES("Education Training");
INSERT INTO list_of_services(name) VALUES("Environment & Conservation");
INSERT INTO list_of_services(name) VALUES("Homeless Serivices");
INSERT INTO list_of_services(name) VALUES("Indigenous Australians");
INSERT INTO list_of_services(name) VALUES("Mental Health");
INSERT INTO list_of_services(name) VALUES("Senior & Aged Care");
INSERT INTO list_of_services(name) VALUES("Veteran Services");
INSERT INTO list_of_services(name) VALUES("Others");

INSERT INTO position_list(name) VALUES("General Assistant");
INSERT INTO position_list(name) VALUES("Team Supervision");
INSERT INTO position_list(name) VALUES("Setup & Breakdown");
INSERT INTO position_list(name) VALUES("Directing Attendees & Providing Information");
INSERT INTO position_list(name) VALUES("Registration & Tickets Sales");
INSERT INTO position_list(name) VALUES("Food Booths Assistant");
INSERT INTO position_list(name) VALUES("Security");
INSERT INTO position_list(name) VALUES("First Aid");
INSERT INTO position_list(name) VALUES("Backstage Operations");
INSERT INTO position_list(name) VALUES("Photographers");
INSERT INTO position_list(name) VALUES("Merchandise Sales");
INSERT INTO position_list(name) VALUES("Media Team");
INSERT INTO position_list(name) VALUES("Customer Service");
INSERT INTO position_list(name) VALUES("Others");

INSERT INTO `users` (`user_firstname`, `user_lastname`, `user_password`, `user_email`, `user_phone`, `user_skill`, `user_experience`)
VALUES 
('John', 'Doe', 'password1', 'john.doe@example.com', 1234567890, 'Skill 1', 'Experience 1'),
('Jane', 'Doe', 'password2', 'jane.doe@example.com', 1234567891, 'Skill 2', 'Experience 2'),
('Jim', 'Smith', 'password3', 'jim.smith@example.com', 1234567892, 'Skill 3', 'Experience 3'),
('Jill', 'Smith', 'password4', 'jill.smith@example.com', 1234567893, 'Skill 4', 'Experience 4'),
('Joe', 'Johnson', 'password5', 'joe.johnson@example.com', 1234567894, 'Skill 5', 'Experience 5'),
('Jenny', 'Johnson', 'password6', 'jenny.johnson@example.com', 1234567895, 'Skill 6', 'Experience 6'),
('Jack', 'Williams', 'password7', 'jack.williams@example.com', 1234567896, 'Skill 7', 'Experience 7'),
('Julie', 'Williams', 'password8', 'julie.williams@example.com', 1234567897, 'Skill 8', 'Experience 8'),
('Jerry', 'Brown', 'password9', 'jerry.brown@example.com', 1234567898, 'Skill 9', 'Experience 9'),
('Jessica', 'Brown', 'password10', 'jessica.brown@example.com', 1234567899, 'Skill 10', 'Experience 10');

INSERT INTO `address` (`number`, `street`, `city`, `state`, `postcode`)
VALUES 
(123, 'Baker Street', 'London', 'Greater London', 12345),
(456, 'Fifth Avenue', 'New York', 'New York', 23456),
(789, 'Champs-Élysées', 'Paris', 'Île-de-France', 34567),
(101, 'Via Roma', 'Florence', 'Tuscany', 45678),
(112, 'La Rambla', 'Barcelona', 'Catalonia', 56789),
(131, 'Unter den Linden', 'Berlin', 'Berlin', 67890),
(415, 'Orchard Road', 'Singapore', 'Central Region', 78901),
(161, 'Ginza', 'Tokyo', 'Tokyo', 89012),
(718, 'Bourke Street', 'Melbourne', 'Victoria', 90123),
(192, 'Queen Street', 'Brisbane', 'Queensland', 10234),
(2, 'Chief Street', 'Hindmarsh', 'South Australia', 5007);

INSERT INTO `organisations` (`abn`, `name`, `manager_firstname`, `manager_lastname`, `email`, `phone_number`, `password`, `description`, `address_id`)
VALUES 
(123456789, 'Tech Solutions', 'John', 'Doe', 'john.doe@techsolutions.com', 123457890, 'password1', 'Tech Solutions is a leading provider of IT services and solutions.', 1000),
(234567890, 'Health First', 'Jane', 'Smith', 'jane.smith@healthfirst.com', 234567901, 'password2', 'Health First is dedicated to providing top-notch healthcare services.', 1001),
(345678901, 'Eco Builders', 'Jim', 'Johnson', 'jim.johnson@ecobuilders.com', 345789012, 'password3', 'Eco Builders is committed to building sustainable and energy-efficient homes.', 1002),
(456789012, 'Learning Tree', 'Jill', 'Williams', 'jill.williams@learningtree.com', 467890123, 'password4', 'Learning Tree is a premier institution for comprehensive education services.', 1003),
(567890123, 'Market Movers', 'Joe', 'Brown', 'joe.brown@marketmovers.com', 567890124, 'password5', 'Market Movers is a trusted name in financial advisory and investment services.', 1004),
(678901234, 'Safe Travels', 'Jenny', 'Davis', 'jenny.davis@safetravels.com', 678912345, 'password6', 'Safe Travels offers a wide range of travel and tourism services.', 1005),
(789012345, 'Fit & Fab', 'Jack', 'Miller', 'jack.miller@fitandfab.com', 789012356, 'password7', 'Fit & Fab is a fitness center offering personalized workout and diet plans.', 1006),
(890123456, 'Food Delight', 'Julie', 'Wilson', 'julie.wilson@fooddelight.com', 891234567, 'password8', 'Food Delight is a restaurant serving a variety of delicious cuisines.', 1007),
(901234567, 'Auto Care', 'Jerry', 'Moore', 'jerry.moore@autocare.com', 901234578, 'password9', 'Auto Care provides quality car repair and maintenance services.', 1008),
(102345678, 'Style Loft', 'Jessica', 'Taylor', 'jessica.taylor@styleloft.com', 103456789, 'password10', 'Style Loft is a fashion boutique offering the latest in apparel and accessories.', 1009),
(123456478, 'Food on the table', 'Tom', 'Brown', 'events@foodonthetable.org.au', 422923721, '$2b$10$/prOavXpg2cY6XqcBmo6b.NplQTI3z.z79K9LmJOpJnuZR07Agqnm', 'Food on the Table is a 100% profit for purpose community functions/meetings space.
We provide food, support, and training opportunities for marginalised groups, including those experiencing homelessness. All profits generated service our mission. Our core vision for our humble venue is to be a place that in some way provides hope, support, love and inspiration to our community, and to help ensure that "No-one Goes Hungry"', 1010);

INSERT INTO `organisation_services` (`service_id`, `abn`) VALUES
(1000, 123456789),
(1001, 234567890),
(1002, 345678901),
(1003, 456789012),
(1004, 567890123),
(1005, 678901234),
(1006, 789012345),
(1007, 890123456),
(1008, 901234567),
(1009, 102345678),
(1010, 234567890),
(1011, 345678901),
(1012, 456789012),
(1000, 567890123),
(1001, 678901234),
(1002, 789012345),
(1003, 890123456),
(1004, 901234567),
(1005, 102345678),
(1003, 123456478);

INSERT INTO `updates` (`update_title`, `update_date_posted`, `update_description`, `isPublic`, `abn`) VALUES
('Welcome New Members!', '2024-01-10 09:00:00', 'We are excited to welcome all new members who joined our community recently. Together, we can achieve great things!', 1, 123456478),
('Upcoming Event: Community Clean-Up', '2024-01-15 12:00:00', 'Join us for a community clean-up event on February 2nd. Let’s keep our environment clean and green!', 1, 123456478),
('Volunteer Training Session', '2024-01-20 14:30:00', 'A training session for all volunteers will be held on January 25th. This is a great opportunity to learn and prepare for upcoming events.', 1, 123456478),
('New Partnership Announcement', '2024-01-25 10:00:00', 'We are thrilled to announce a new partnership with XYZ Corporation. This partnership will help us expand our community services.', 1, 123456478),
('Monthly Newsletter: January 2024', '2024-01-30 08:00:00', 'Check out our latest newsletter for January 2024, which includes updates, event schedules, and member highlights.', 0, 123456478);

INSERT INTO `emailconsent` (`updatesConsent`, `eventsConsent`) VALUES
(1, 1),
(0, 1),
(1, 0),
(1, 1),
(0, 0),
(1, 1),
(0, 1),
(1, 0),
(1, 1),
(0, 0);

INSERT INTO `members` (`joined_date`, `user_id`, `abn`, `consent_id`) VALUES
('2024-01-01', 1000, 123456478, 1000),
('2024-01-01', 1001, 123456478, 1001),
('2024-01-01', 1002, 123456478, 1002),
('2024-01-01', 1003, 123456478, 1003),
('2024-01-01', 1004, 123456478, 1004),
('2024-01-01', 1005, 123456478, 1005),
('2024-01-01', 1006, 123456478, 1006),
('2024-01-01', 1007, 123456478, 1007),
('2024-01-01', 1008, 123456478, 1008),
('2024-01-01', 1009, 123456478, 1009);

INSERT INTO `events` (`event_title`,`event_start_date`,`event_end_date`,`event_description`, `abn`, `address_id`) VALUES
('Member Welcoming event', '2024-02-02', '2024-02-02', 
'Join us for an uplifting and heartwarming event as we welcome new volunteers to our compassionate community! At the “Community Caring Welcome,” we celebrate the spirit of giving, kindness, and solidarity.',
'123456478', 1010),
('Another Event', '2028-01-01', '2028-01-05', 'A short description', '123456478', 1010);

INSERT INTO `events_shift` (`date`, `start_time`, `end_time`, `description`, `event_id`) VALUES
('2024-02-02', '09:00:00', '12:00:00', 'Morning shift for welcoming event', 1000),
('2024-02-02', '13:00:00', '16:00:00', 'Afternoon shift for welcoming event', 1000),
('2024-02-02', '17:00:00', '20:00:00', 'Evening shift for welcoming event', 1000),
('2028-01-01', '10:00:00', '14:00:00', 'Morning shift for another event', 1001),
('2028-01-02', '14:00:00', '18:00:00', 'Afternoon shift for another event', 1001);

INSERT INTO `shift_positions` (`position_id`, `shift_id`, `num_people`) VALUES
(1000, 1000, 5),
(1001, 1000, 2),
(1002, 1000, 3),

(1003, 1001, 4),
(1004, 1001, 3),
(1005, 1001, 2),

(1006, 1002, 4),
(1007, 1002, 2),
(1008, 1002, 3);

INSERT INTO `shift_positions` (`position_id`, `shift_id`, `num_people`) VALUES
(1009, 1003, 2),
(1010, 1003, 3),

(1011, 1004, 4),
(1012, 1004, 3),
(1013, 1004, 2);

INSERT INTO `events_application` (`user_id`, `position_id`, `shift_id`) VALUES
(1000, 1000, 1000),
(1001, 1001, 1000),
(1002, 1003, 1001),
(1003, 1006, 1002),
(1004, 1008, 1002),

(1000, 1003, 1001),
(1002, 1002, 1000),
(1001, 1007, 1002),

(1005, 1009, 1003),
(1006, 1010, 1003),
(1007, 1011, 1004),
(1008, 1012, 1004),
(1009, 1013, 1004),

(1005, 1011, 1004),
(1006, 1012, 1004);


INSERT INTO `admins` (`name`,`email`,`phone_number`,`password`) VALUES
('Group49Admin','volunteerwdcgroup49@gmail.com','999999999','$2b$10$g5Pu5Zfc67zT01cvKtt20uOrLUyCFW4R3scbPpDwiWdo6w95jbm2q');

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
