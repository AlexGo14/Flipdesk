--
-- PostgreSQL database dump
--

-- Dumped from database version 9.4.4
-- Dumped by pg_dump version 9.4.4
-- Started on 2015-09-13 16:40:13 CEST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- TOC entry 2161 (class 1262 OID 16385)
-- Name: Ticketsystem; Type: DATABASE; Schema: -; Owner: admin
--

CREATE DATABASE "Ticketsystem" WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_GB.UTF-8' LC_CTYPE = 'en_GB.UTF-8';


ALTER DATABASE "Ticketsystem" OWNER TO admin;

\connect "Ticketsystem"

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- TOC entry 190 (class 3079 OID 11907)
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- TOC entry 2164 (class 0 OID 0)
-- Dependencies: 190
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 172 (class 1259 OID 16386)
-- Name: agent; Type: TABLE; Schema: public; Owner: admin; Tablespace: 
--

CREATE TABLE agent (
    id integer NOT NULL,
    first_name character varying(200) NOT NULL,
    last_name character varying(200) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_timestamp timestamp with time zone,
    is_admin boolean DEFAULT false NOT NULL,
    password character(60) NOT NULL,
    email character varying(250) NOT NULL,
    active boolean DEFAULT true NOT NULL,
    login_pw_change boolean DEFAULT true NOT NULL
);


ALTER TABLE agent OWNER TO admin;

--
-- TOC entry 173 (class 1259 OID 16395)
-- Name: agent_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE agent_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE agent_id_seq OWNER TO admin;

--
-- TOC entry 2165 (class 0 OID 0)
-- Dependencies: 173
-- Name: agent_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE agent_id_seq OWNED BY agent.id;


--
-- TOC entry 174 (class 1259 OID 16397)
-- Name: blacklist; Type: TABLE; Schema: public; Owner: admin; Tablespace: 
--

CREATE TABLE blacklist (
    id integer NOT NULL,
    email character varying(200) NOT NULL
);


ALTER TABLE blacklist OWNER TO admin;

--
-- TOC entry 175 (class 1259 OID 16400)
-- Name: blacklist_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE blacklist_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE blacklist_id_seq OWNER TO admin;

--
-- TOC entry 2166 (class 0 OID 0)
-- Dependencies: 175
-- Name: blacklist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE blacklist_id_seq OWNED BY blacklist.id;


--
-- TOC entry 176 (class 1259 OID 16402)
-- Name: comment; Type: TABLE; Schema: public; Owner: admin; Tablespace: 
--

CREATE TABLE comment (
    id integer NOT NULL,
    description text NOT NULL,
    fk_user_id integer,
    fk_agent_id integer,
    fk_ticket_id integer NOT NULL,
    fk_previous_comment_id integer,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE comment OWNER TO admin;

--
-- TOC entry 177 (class 1259 OID 16409)
-- Name: comment_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE comment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE comment_id_seq OWNER TO admin;

--
-- TOC entry 2167 (class 0 OID 0)
-- Dependencies: 177
-- Name: comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE comment_id_seq OWNED BY comment.id;


--
-- TOC entry 178 (class 1259 OID 16411)
-- Name: customer; Type: TABLE; Schema: public; Owner: admin; Tablespace: 
--

CREATE TABLE customer (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    email_contact character varying(200) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_timestamp timestamp with time zone,
    fk_created_by_admin integer NOT NULL,
    active boolean DEFAULT true NOT NULL,
    username_mailbox character varying(100),
    password_mailbox character varying(100),
    email_mailbox_imap character varying(250),
    email_mailbox_smtp character varying(250),
    email_domain character varying(128) NOT NULL
);


ALTER TABLE customer OWNER TO admin;

--
-- TOC entry 179 (class 1259 OID 16419)
-- Name: customer_datamodel; Type: TABLE; Schema: public; Owner: admin; Tablespace: 
--

CREATE TABLE customer_datamodel (
    id integer NOT NULL,
    fk_customer_id integer NOT NULL,
    fk_datatype_id integer NOT NULL,
    name character varying(30) NOT NULL,
    mandatory boolean DEFAULT false NOT NULL,
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE customer_datamodel OWNER TO admin;

--
-- TOC entry 180 (class 1259 OID 16424)
-- Name: customer_datamodel_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE customer_datamodel_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE customer_datamodel_id_seq OWNER TO admin;

--
-- TOC entry 2168 (class 0 OID 0)
-- Dependencies: 180
-- Name: customer_datamodel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE customer_datamodel_id_seq OWNED BY customer_datamodel.id;


--
-- TOC entry 181 (class 1259 OID 16426)
-- Name: customer_datatype; Type: TABLE; Schema: public; Owner: admin; Tablespace: 
--

CREATE TABLE customer_datatype (
    id integer NOT NULL,
    datatype character varying(15) NOT NULL
);


ALTER TABLE customer_datatype OWNER TO admin;

--
-- TOC entry 182 (class 1259 OID 16429)
-- Name: customer_datatype_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE customer_datatype_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE customer_datatype_id_seq OWNER TO admin;

--
-- TOC entry 2169 (class 0 OID 0)
-- Dependencies: 182
-- Name: customer_datatype_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE customer_datatype_id_seq OWNED BY customer_datatype.id;


--
-- TOC entry 183 (class 1259 OID 16431)
-- Name: customer_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE customer_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE customer_id_seq OWNER TO admin;

--
-- TOC entry 2170 (class 0 OID 0)
-- Dependencies: 183
-- Name: customer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE customer_id_seq OWNED BY customer.id;


--
-- TOC entry 184 (class 1259 OID 16433)
-- Name: ticket; Type: TABLE; Schema: public; Owner: admin; Tablespace: 
--

CREATE TABLE ticket (
    id integer NOT NULL,
    description text NOT NULL,
    fk_user_id integer NOT NULL,
    caption text NOT NULL,
    fk_agent_id integer,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_timestamp timestamp with time zone,
    solved boolean DEFAULT false NOT NULL,
    archived boolean DEFAULT false NOT NULL
);


ALTER TABLE ticket OWNER TO admin;

--
-- TOC entry 185 (class 1259 OID 16441)
-- Name: ticket_datamodel; Type: TABLE; Schema: public; Owner: admin; Tablespace: 
--

CREATE TABLE ticket_datamodel (
    id integer NOT NULL,
    fk_ticket_id integer NOT NULL,
    fk_datamodel_id integer NOT NULL,
    value character varying
);


ALTER TABLE ticket_datamodel OWNER TO admin;

--
-- TOC entry 186 (class 1259 OID 16447)
-- Name: ticket_datamodel_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE ticket_datamodel_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE ticket_datamodel_id_seq OWNER TO admin;

--
-- TOC entry 2171 (class 0 OID 0)
-- Dependencies: 186
-- Name: ticket_datamodel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE ticket_datamodel_id_seq OWNED BY ticket_datamodel.id;


--
-- TOC entry 187 (class 1259 OID 16449)
-- Name: ticket_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE ticket_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE ticket_id_seq OWNER TO admin;

--
-- TOC entry 2172 (class 0 OID 0)
-- Dependencies: 187
-- Name: ticket_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE ticket_id_seq OWNED BY ticket.id;


--
-- TOC entry 188 (class 1259 OID 16451)
-- Name: user; Type: TABLE; Schema: public; Owner: admin; Tablespace: 
--

CREATE TABLE "user" (
    id integer NOT NULL,
    first_name character varying(200) NOT NULL,
    last_name character varying(200) NOT NULL,
    email character varying(200) NOT NULL,
    fk_customer_id integer NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_timestamp timestamp with time zone,
    password character(60) NOT NULL,
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE "user" OWNER TO admin;

--
-- TOC entry 189 (class 1259 OID 16459)
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE user_id_seq OWNER TO admin;

--
-- TOC entry 2173 (class 0 OID 0)
-- Dependencies: 189
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE user_id_seq OWNED BY "user".id;


--
-- TOC entry 1988 (class 2604 OID 16461)
-- Name: id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY agent ALTER COLUMN id SET DEFAULT nextval('agent_id_seq'::regclass);


--
-- TOC entry 1990 (class 2604 OID 16462)
-- Name: id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY blacklist ALTER COLUMN id SET DEFAULT nextval('blacklist_id_seq'::regclass);


--
-- TOC entry 1992 (class 2604 OID 16463)
-- Name: id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY comment ALTER COLUMN id SET DEFAULT nextval('comment_id_seq'::regclass);


--
-- TOC entry 1995 (class 2604 OID 16464)
-- Name: id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY customer ALTER COLUMN id SET DEFAULT nextval('customer_id_seq'::regclass);


--
-- TOC entry 1998 (class 2604 OID 16465)
-- Name: id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY customer_datamodel ALTER COLUMN id SET DEFAULT nextval('customer_datamodel_id_seq'::regclass);


--
-- TOC entry 1999 (class 2604 OID 16466)
-- Name: id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY customer_datatype ALTER COLUMN id SET DEFAULT nextval('customer_datatype_id_seq'::regclass);


--
-- TOC entry 2002 (class 2604 OID 16467)
-- Name: id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY ticket ALTER COLUMN id SET DEFAULT nextval('ticket_id_seq'::regclass);


--
-- TOC entry 2004 (class 2604 OID 16468)
-- Name: id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY ticket_datamodel ALTER COLUMN id SET DEFAULT nextval('ticket_datamodel_id_seq'::regclass);


--
-- TOC entry 2007 (class 2604 OID 16469)
-- Name: id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY "user" ALTER COLUMN id SET DEFAULT nextval('user_id_seq'::regclass);


--
-- TOC entry 2019 (class 2606 OID 16473)
-- Name: Customer_name_key; Type: CONSTRAINT; Schema: public; Owner: admin; Tablespace: 
--

ALTER TABLE ONLY customer
    ADD CONSTRAINT "Customer_name_key" UNIQUE (name);


--
-- TOC entry 2021 (class 2606 OID 16475)
-- Name: Customer_pkey; Type: CONSTRAINT; Schema: public; Owner: admin; Tablespace: 
--

ALTER TABLE ONLY customer
    ADD CONSTRAINT "Customer_pkey" PRIMARY KEY (id);


--
-- TOC entry 2009 (class 2606 OID 16477)
-- Name: agent_pkey; Type: CONSTRAINT; Schema: public; Owner: admin; Tablespace: 
--

ALTER TABLE ONLY agent
    ADD CONSTRAINT agent_pkey PRIMARY KEY (id);


--
-- TOC entry 2013 (class 2606 OID 16479)
-- Name: blacklist_email_key; Type: CONSTRAINT; Schema: public; Owner: admin; Tablespace: 
--

ALTER TABLE ONLY blacklist
    ADD CONSTRAINT blacklist_email_key UNIQUE (email);


--
-- TOC entry 2015 (class 2606 OID 16481)
-- Name: blacklist_pkey; Type: CONSTRAINT; Schema: public; Owner: admin; Tablespace: 
--

ALTER TABLE ONLY blacklist
    ADD CONSTRAINT blacklist_pkey PRIMARY KEY (id);


--
-- TOC entry 2017 (class 2606 OID 16483)
-- Name: comments_pkey; Type: CONSTRAINT; Schema: public; Owner: admin; Tablespace: 
--

ALTER TABLE ONLY comment
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- TOC entry 2023 (class 2606 OID 16485)
-- Name: customer_datamodel_pkey; Type: CONSTRAINT; Schema: public; Owner: admin; Tablespace: 
--

ALTER TABLE ONLY customer_datamodel
    ADD CONSTRAINT customer_datamodel_pkey PRIMARY KEY (id);


--
-- TOC entry 2025 (class 2606 OID 16576)
-- Name: customer_datamodel_unique_name; Type: CONSTRAINT; Schema: public; Owner: admin; Tablespace: 
--

ALTER TABLE ONLY customer_datamodel
    ADD CONSTRAINT customer_datamodel_unique_name UNIQUE (fk_customer_id, name);


--
-- TOC entry 2174 (class 0 OID 0)
-- Dependencies: 2025
-- Name: CONSTRAINT customer_datamodel_unique_name ON customer_datamodel; Type: COMMENT; Schema: public; Owner: admin
--

COMMENT ON CONSTRAINT customer_datamodel_unique_name ON customer_datamodel IS 'A name - customer datamodel binding has to be unique.
Key is a combination of (customer_id and name).';


--
-- TOC entry 2027 (class 2606 OID 16487)
-- Name: customer_datatype_datatype_key; Type: CONSTRAINT; Schema: public; Owner: admin; Tablespace: 
--

ALTER TABLE ONLY customer_datatype
    ADD CONSTRAINT customer_datatype_datatype_key UNIQUE (datatype);


--
-- TOC entry 2029 (class 2606 OID 16489)
-- Name: customer_datatype_pkey; Type: CONSTRAINT; Schema: public; Owner: admin; Tablespace: 
--

ALTER TABLE ONLY customer_datatype
    ADD CONSTRAINT customer_datatype_pkey PRIMARY KEY (id);


--
-- TOC entry 2033 (class 2606 OID 16491)
-- Name: ticket_datamodel_pkey; Type: CONSTRAINT; Schema: public; Owner: admin; Tablespace: 
--

ALTER TABLE ONLY ticket_datamodel
    ADD CONSTRAINT ticket_datamodel_pkey PRIMARY KEY (id);


--
-- TOC entry 2031 (class 2606 OID 16493)
-- Name: ticket_pkey; Type: CONSTRAINT; Schema: public; Owner: admin; Tablespace: 
--

ALTER TABLE ONLY ticket
    ADD CONSTRAINT ticket_pkey PRIMARY KEY (id);


--
-- TOC entry 2011 (class 2606 OID 16566)
-- Name: unique_email; Type: CONSTRAINT; Schema: public; Owner: admin; Tablespace: 
--

ALTER TABLE ONLY agent
    ADD CONSTRAINT unique_email UNIQUE (email);


--
-- TOC entry 2035 (class 2606 OID 16495)
-- Name: user_pkey; Type: CONSTRAINT; Schema: public; Owner: admin; Tablespace: 
--

ALTER TABLE ONLY "user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- TOC entry 2036 (class 2606 OID 16496)
-- Name: comment_fk_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY comment
    ADD CONSTRAINT comment_fk_agent_id_fkey FOREIGN KEY (fk_agent_id) REFERENCES agent(id);


--
-- TOC entry 2037 (class 2606 OID 16501)
-- Name: comment_fk_previous_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY comment
    ADD CONSTRAINT comment_fk_previous_comment_id_fkey FOREIGN KEY (fk_previous_comment_id) REFERENCES comment(id);


--
-- TOC entry 2038 (class 2606 OID 16506)
-- Name: comment_fk_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY comment
    ADD CONSTRAINT comment_fk_ticket_id_fkey FOREIGN KEY (fk_ticket_id) REFERENCES ticket(id);


--
-- TOC entry 2039 (class 2606 OID 16511)
-- Name: comment_fk_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY comment
    ADD CONSTRAINT comment_fk_user_id_fkey FOREIGN KEY (fk_user_id) REFERENCES "user"(id);


--
-- TOC entry 2041 (class 2606 OID 16516)
-- Name: customer_datamodel_fk_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY customer_datamodel
    ADD CONSTRAINT customer_datamodel_fk_customer_id_fkey FOREIGN KEY (fk_customer_id) REFERENCES customer(id);


--
-- TOC entry 2042 (class 2606 OID 16521)
-- Name: customer_datamodel_fk_datatype_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY customer_datamodel
    ADD CONSTRAINT customer_datamodel_fk_datatype_id_fkey FOREIGN KEY (fk_datatype_id) REFERENCES customer_datatype(id);


--
-- TOC entry 2040 (class 2606 OID 16526)
-- Name: customer_fk_created_by_admin_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY customer
    ADD CONSTRAINT customer_fk_created_by_admin_fkey FOREIGN KEY (fk_created_by_admin) REFERENCES agent(id);


--
-- TOC entry 2045 (class 2606 OID 16531)
-- Name: ticket_datamodel_fk_datamodel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY ticket_datamodel
    ADD CONSTRAINT ticket_datamodel_fk_datamodel_id_fkey FOREIGN KEY (fk_datamodel_id) REFERENCES customer_datamodel(id);


--
-- TOC entry 2046 (class 2606 OID 16536)
-- Name: ticket_datamodel_fk_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY ticket_datamodel
    ADD CONSTRAINT ticket_datamodel_fk_ticket_id_fkey FOREIGN KEY (fk_ticket_id) REFERENCES ticket(id);


--
-- TOC entry 2043 (class 2606 OID 16541)
-- Name: ticket_fk_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY ticket
    ADD CONSTRAINT ticket_fk_agent_id_fkey FOREIGN KEY (fk_agent_id) REFERENCES agent(id);


--
-- TOC entry 2044 (class 2606 OID 16546)
-- Name: ticket_fk_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY ticket
    ADD CONSTRAINT ticket_fk_user_id_fkey FOREIGN KEY (fk_user_id) REFERENCES "user"(id);


--
-- TOC entry 2047 (class 2606 OID 16551)
-- Name: user_fk_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY "user"
    ADD CONSTRAINT user_fk_customer_id_fkey FOREIGN KEY (fk_customer_id) REFERENCES customer(id);


--
-- TOC entry 2163 (class 0 OID 0)
-- Dependencies: 6
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO admin;
GRANT ALL ON SCHEMA public TO PUBLIC;


-- Completed on 2015-09-13 16:40:13 CEST

--
-- PostgreSQL database dump complete
--

