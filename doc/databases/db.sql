SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for action_type_emails
-- ----------------------------
DROP TABLE IF EXISTS `action_type_emails`;
CREATE TABLE `action_type_emails` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(145) NOT NULL,
  `subject` varchar(245) DEFAULT NULL,
  `template` longtext,
  `MAIL_MAILER` varchar(10) DEFAULT NULL,
  `MAIL_HOST` varchar(45) DEFAULT NULL,
  `MAIL_PORT` int DEFAULT NULL,
  `MAIL_USERNAME` varchar(245) DEFAULT NULL,
  `MAIL_PASSWORD` varchar(245) DEFAULT NULL,
  `MAIL_ENCRYPTION` varchar(5) DEFAULT NULL,
  `MAIL_FROM_ADDRESS` varchar(245) DEFAULT NULL,
  `MAIL_FROM_NAME` varchar(245) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  `actived` tinyint(1) DEFAULT '1',
  `actions_id` int NOT NULL,
  `listEmails` text,
  PRIMARY KEY (`id`),
  KEY `fk_action_type_emails_actions1_idx` (`actions_id`),
  CONSTRAINT `fk_action_type_emails_actions1` FOREIGN KEY (`actions_id`) REFERENCES `actions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Table structure for action_type_http_request
-- ----------------------------
DROP TABLE IF EXISTS `action_type_http_request`;
CREATE TABLE `action_type_http_request` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `url` varchar(254) NOT NULL,
  `method` varchar(10) NOT NULL,
  `body` longtext,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  `actived` tinyint(1) DEFAULT '1',
  `actions_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_actions_type_http_request_actions1_idx` (`actions_id`),
  CONSTRAINT `fk_actions_type_http_request_actions1` FOREIGN KEY (`actions_id`) REFERENCES `actions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Table structure for action_type_process_data
-- ----------------------------
DROP TABLE IF EXISTS `action_type_process_data`;
CREATE TABLE `action_type_process_data` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(145) NOT NULL,
  `functionProcessData` longtext NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  `actived` tinyint(1) DEFAULT '1',
  `actions_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_action_type_process_data_actions1_idx` (`actions_id`),
  CONSTRAINT `fk_action_type_process_data_actions1` FOREIGN KEY (`actions_id`) REFERENCES `actions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Table structure for actions
-- ----------------------------
DROP TABLE IF EXISTS `actions`;
CREATE TABLE `actions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(245) DEFAULT NULL,
  `scriptActionPrev` longtext,
  `scriptActionPost` longtext,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  `actived` tinyint(1) DEFAULT '1',
  `action_type_id` int NOT NULL,
  `nodes_flows_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_actions_action_type_idx` (`action_type_id`),
  KEY `fk_actions_nodes_flows1_idx` (`nodes_flows_id`),
  CONSTRAINT `fk_actions_action_type` FOREIGN KEY (`action_type_id`) REFERENCES `actions_types` (`id`),
  CONSTRAINT `fk_actions_nodes_flows1` FOREIGN KEY (`nodes_flows_id`) REFERENCES `nodes_flows` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Table structure for actions_types
-- ----------------------------
DROP TABLE IF EXISTS `actions_types`;
CREATE TABLE `actions_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(145) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  `actived` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Table structure for actions_types_jwt
-- ----------------------------
DROP TABLE IF EXISTS `actions_types_jwt`;
CREATE TABLE `actions_types_jwt` (
  `id` int NOT NULL AUTO_INCREMENT,
  `secret` text,
  `objectEncrypt` text,
  `objectSettings` text,
  `type` set('sign','verify') DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  `actived` tinyint(1) DEFAULT '1',
  `actions_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_actions_types_jwt_actions1_idx` (`actions_id`),
  CONSTRAINT `fk_actions_types_jwt_actions1` FOREIGN KEY (`actions_id`) REFERENCES `actions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Table structure for actions_types_md5
-- ----------------------------
DROP TABLE IF EXISTS `actions_types_md5`;
CREATE TABLE `actions_types_md5` (
  `id` int NOT NULL AUTO_INCREMENT,
  `secret` text,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  `actived` tinyint(1) DEFAULT '1',
  `actions_id` int NOT NULL,
  `value` text,
  PRIMARY KEY (`id`),
  KEY `fk_actions_types_jwt_actions1_idx` (`actions_id`),
  CONSTRAINT `fk_actions_types_jwt_actions10` FOREIGN KEY (`actions_id`) REFERENCES `actions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Table structure for databases_rds
-- ----------------------------
DROP TABLE IF EXISTS `databases_rds`;
CREATE TABLE `databases_rds` (
  `id` int NOT NULL AUTO_INCREMENT,
  `DB_CONNECTION` varchar(45) NOT NULL,
  `DB_HOST` varchar(245) NOT NULL,
  `DB_PORT` int NOT NULL,
  `DB_DATABASE` varchar(245) NOT NULL,
  `DB_USERNAME` varchar(245) NOT NULL,
  `DB_PASSWORD` text,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  `actived` tinyint(1) DEFAULT '1',
  `actions_id` int NOT NULL,
  `query` longtext NOT NULL,
  `valuesQuey` longtext COMMENT 'Los valores aqui almacenados los separamos por comas.',
  PRIMARY KEY (`id`),
  KEY `fk_databases_rds_actions1_idx` (`actions_id`),
  CONSTRAINT `fk_databases_rds_actions1` FOREIGN KEY (`actions_id`) REFERENCES `actions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Table structure for emails
-- ----------------------------
DROP TABLE IF EXISTS `emails`;
CREATE TABLE `emails` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(254) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  `actived` tinyint(1) DEFAULT '1',
  `action_type_emails_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_emails_action_type_emails1_idx` (`action_type_emails_id`),
  CONSTRAINT `fk_emails_action_type_emails1` FOREIGN KEY (`action_type_emails_id`) REFERENCES `action_type_emails` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Table structure for fields_login
-- ----------------------------
DROP TABLE IF EXISTS `fields_login`;
CREATE TABLE `fields_login` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(245) NOT NULL,
  `label` varchar(245) NOT NULL,
  `type` varchar(45) NOT NULL,
  `iconUrl` text,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  `actived` tinyint(1) DEFAULT '1',
  `steps_logins_id` int NOT NULL,
  `value` varchar(245) DEFAULT NULL,
  `maxlength` varchar(45) DEFAULT NULL,
  `minlength` varchar(45) DEFAULT NULL,
  `checked` varchar(10) DEFAULT NULL,
  `pattern` varchar(245) DEFAULT NULL,
  `autocomplete` varchar(10) DEFAULT NULL,
  `autocorrect` varchar(10) DEFAULT NULL,
  `disabled` varchar(10) DEFAULT NULL,
  `inputmode` varchar(45) DEFAULT NULL,
  `max` varchar(45) DEFAULT NULL,
  `min` varchar(45) DEFAULT NULL,
  `placeholder` varchar(245) DEFAULT NULL,
  `readonly` varchar(10) DEFAULT NULL,
  `required` varchar(10) DEFAULT NULL,
  `optionsSelect` text,
  `class` varchar(245) DEFAULT NULL,
  `description` varchar(245) DEFAULT NULL,
  `tabIndex` varchar(10) DEFAULT NULL,
  `autofocus` varchar(10) DEFAULT 'false',
  PRIMARY KEY (`id`),
  KEY `fk_fields_login_steps_logins1_idx` (`steps_logins_id`),
  CONSTRAINT `fk_fields_login_steps_logins1` FOREIGN KEY (`steps_logins_id`) REFERENCES `steps_logins` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Table structure for headers
-- ----------------------------
DROP TABLE IF EXISTS `headers`;
CREATE TABLE `headers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(254) DEFAULT NULL,
  `value` text,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  `actived` tinyint(1) DEFAULT '1',
  `action_type_http_request_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_headers_action_type_http_request1_idx` (`action_type_http_request_id`),
  CONSTRAINT `fk_headers_action_type_http_request1` FOREIGN KEY (`action_type_http_request_id`) REFERENCES `action_type_http_request` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Table structure for history_flow
-- ----------------------------
DROP TABLE IF EXISTS `history_flow`;
CREATE TABLE `history_flow` (
  `id` int NOT NULL AUTO_INCREMENT,
  `response` longtext,
  `request` longtext,
  `error` longtext,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  `actived` tinyint(1) DEFAULT '1',
  `actions_id` int DEFAULT NULL,
  `inputs_updates_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Table structure for inputs_updates
-- ----------------------------
DROP TABLE IF EXISTS `inputs_updates`;
CREATE TABLE `inputs_updates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bodyRequest` longtext NOT NULL,
  `processStatus` set('pending','processing','processed','invalid') DEFAULT 'pending',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  `actived` tinyint(1) DEFAULT '1',
  `source_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_inputs_updates_source1_idx` (`source_id`),
  CONSTRAINT `fk_inputs_updates_source1` FOREIGN KEY (`source_id`) REFERENCES `sources` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1988 DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Table structure for logins_authorizations
-- ----------------------------
DROP TABLE IF EXISTS `logins_authorizations`;
CREATE TABLE `logins_authorizations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(245) DEFAULT NULL,
  `userId` varchar(245) DEFAULT NULL,
  `email` varchar(245) DEFAULT NULL,
  `tokenAuthorization` text,
  `idToken` text,
  `accessToken` text,
  `expiresIn` varchar(45) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  `actived` tinyint(1) DEFAULT '1',
  `state` set('pending','processing','processed','invalid') DEFAULT 'pending',
  `error` text,
  `types_logins_id` int DEFAULT NULL,
  `redirect_uri` text,
  `stateVtex` text NOT NULL,
  `codeVerify` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci,
  `codeAuthorization` text,
  `password` varchar(245) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_logins_authorizations_types_logins1_idx` (`types_logins_id`),
  CONSTRAINT `fk_logins_authorizations_types_logins1` FOREIGN KEY (`types_logins_id`) REFERENCES `types_logins` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Table structure for nodes_flows
-- ----------------------------
DROP TABLE IF EXISTS `nodes_flows`;
CREATE TABLE `nodes_flows` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(145) NOT NULL,
  `label` varchar(245) DEFAULT NULL,
  `async` tinyint DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  `actived` tinyint(1) DEFAULT '1',
  `node_flow_id` int DEFAULT NULL,
  `sources_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_node_flow_node_flow1_idx` (`node_flow_id`),
  KEY `fk_nodes_flows_sources1_idx` (`sources_id`),
  CONSTRAINT `fk_node_flow_node_flow1` FOREIGN KEY (`node_flow_id`) REFERENCES `nodes_flows` (`id`),
  CONSTRAINT `fk_nodes_flows_sources1` FOREIGN KEY (`sources_id`) REFERENCES `sources` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Table structure for settings
-- ----------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(245) DEFAULT NULL,
  `label` varchar(245) DEFAULT NULL,
  `value` text,
  `deleted` tinyint DEFAULT '0',
  `actived` tinyint DEFAULT '1',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Table structure for sources
-- ----------------------------
DROP TABLE IF EXISTS `sources`;
CREATE TABLE `sources` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(245) DEFAULT NULL,
  `description` text,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  `actived` tinyint(1) DEFAULT '1',
  `key` varchar(245) DEFAULT NULL,
  `token` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Table structure for steps_logins
-- ----------------------------
DROP TABLE IF EXISTS `steps_logins`;
CREATE TABLE `steps_logins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(245) DEFAULT NULL,
  `name` varchar(245) NOT NULL,
  `step` int NOT NULL,
  `nameButtonSubmit` varchar(254) DEFAULT NULL,
  `description` text,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  `actived` tinyint(1) DEFAULT '1',
  `sources_id` int DEFAULT NULL,
  `types_logins_id` int NOT NULL,
  `createAccessToken` tinyint DEFAULT '0',
  `createTokenInitial` tinyint DEFAULT '0',
  `generateVerificationCode` tinyint DEFAULT '0',
  `errorMessage` text,
  `validCode` tinyint DEFAULT '0',
  `nameButtonClose` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_steps_logins_sources1_idx` (`sources_id`),
  KEY `fk_steps_logins_types_logins1_idx` (`types_logins_id`),
  CONSTRAINT `fk_steps_logins_sources1` FOREIGN KEY (`sources_id`) REFERENCES `sources` (`id`),
  CONSTRAINT `fk_steps_logins_types_logins1` FOREIGN KEY (`types_logins_id`) REFERENCES `types_logins` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Table structure for types_logins
-- ----------------------------
DROP TABLE IF EXISTS `types_logins`;
CREATE TABLE `types_logins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `providerName` varchar(245) NOT NULL,
  `label` varchar(245) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  `actived` tinyint(1) DEFAULT '1',
  `description` text,
  `iconUrl` text,
  `position` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
