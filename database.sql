--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: Ticketsystem; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON DATABASE "Ticketsystem" IS 'johannes';


--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: agent; Type: TABLE; Schema: public; Owner: johannes; Tablespace: 
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
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.agent OWNER TO johannes;

--
-- Name: agent_id_seq; Type: SEQUENCE; Schema: public; Owner: johannes
--

CREATE SEQUENCE agent_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.agent_id_seq OWNER TO johannes;

--
-- Name: agent_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: johannes
--

ALTER SEQUENCE agent_id_seq OWNED BY agent.id;


--
-- Name: blacklist; Type: TABLE; Schema: public; Owner: johannes; Tablespace: 
--

CREATE TABLE blacklist (
    id integer NOT NULL,
    email character varying(200) NOT NULL
);


ALTER TABLE public.blacklist OWNER TO johannes;

--
-- Name: blacklist_id_seq; Type: SEQUENCE; Schema: public; Owner: johannes
--

CREATE SEQUENCE blacklist_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.blacklist_id_seq OWNER TO johannes;

--
-- Name: blacklist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: johannes
--

ALTER SEQUENCE blacklist_id_seq OWNED BY blacklist.id;


--
-- Name: comment; Type: TABLE; Schema: public; Owner: johannes; Tablespace: 
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


ALTER TABLE public.comment OWNER TO johannes;

--
-- Name: comment_id_seq; Type: SEQUENCE; Schema: public; Owner: johannes
--

CREATE SEQUENCE comment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.comment_id_seq OWNER TO johannes;

--
-- Name: comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: johannes
--

ALTER SEQUENCE comment_id_seq OWNED BY comment.id;


--
-- Name: customer; Type: TABLE; Schema: public; Owner: johannes; Tablespace: 
--

CREATE TABLE customer (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    email_contact character varying(200) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_timestamp timestamp with time zone,
    fk_created_by_admin integer NOT NULL,
    active boolean DEFAULT true NOT NULL,
    email_mailbox character varying(200),
    username_mailbox character varying(100),
    password_mailbox character varying(100)
);


ALTER TABLE public.customer OWNER TO johannes;

--
-- Name: customer_datamodel; Type: TABLE; Schema: public; Owner: johannes; Tablespace: 
--

CREATE TABLE customer_datamodel (
    id integer NOT NULL,
    fk_customer_id integer NOT NULL,
    fk_datatype_id integer NOT NULL,
    name character varying(30) NOT NULL,
    mandatory boolean DEFAULT false NOT NULL
);


ALTER TABLE public.customer_datamodel OWNER TO johannes;

--
-- Name: customer_datamodel_id_seq; Type: SEQUENCE; Schema: public; Owner: johannes
--

CREATE SEQUENCE customer_datamodel_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.customer_datamodel_id_seq OWNER TO johannes;

--
-- Name: customer_datamodel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: johannes
--

ALTER SEQUENCE customer_datamodel_id_seq OWNED BY customer_datamodel.id;


--
-- Name: customer_datatype; Type: TABLE; Schema: public; Owner: johannes; Tablespace: 
--

CREATE TABLE customer_datatype (
    id integer NOT NULL,
    datatype character varying(15) NOT NULL
);


ALTER TABLE public.customer_datatype OWNER TO johannes;

--
-- Name: customer_datatype_id_seq; Type: SEQUENCE; Schema: public; Owner: johannes
--

CREATE SEQUENCE customer_datatype_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.customer_datatype_id_seq OWNER TO johannes;

--
-- Name: customer_datatype_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: johannes
--

ALTER SEQUENCE customer_datatype_id_seq OWNED BY customer_datatype.id;


--
-- Name: customer_id_seq; Type: SEQUENCE; Schema: public; Owner: johannes
--

CREATE SEQUENCE customer_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.customer_id_seq OWNER TO johannes;

--
-- Name: customer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: johannes
--

ALTER SEQUENCE customer_id_seq OWNED BY customer.id;


--
-- Name: ticket; Type: TABLE; Schema: public; Owner: johannes; Tablespace: 
--

CREATE TABLE ticket (
    id integer NOT NULL,
    description text NOT NULL,
    fk_user_id integer NOT NULL,
    caption text NOT NULL,
    fk_agent_id integer,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_timestamp timestamp with time zone,
    solved boolean DEFAULT false NOT NULL
);


ALTER TABLE public.ticket OWNER TO johannes;

--
-- Name: ticket_datamodel; Type: TABLE; Schema: public; Owner: johannes; Tablespace: 
--

CREATE TABLE ticket_datamodel (
    id integer NOT NULL,
    fk_ticket_id integer NOT NULL,
    fk_datamodel_id integer NOT NULL,
    value character varying NOT NULL
);


ALTER TABLE public.ticket_datamodel OWNER TO johannes;

--
-- Name: ticket_datamodel_id_seq; Type: SEQUENCE; Schema: public; Owner: johannes
--

CREATE SEQUENCE ticket_datamodel_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ticket_datamodel_id_seq OWNER TO johannes;

--
-- Name: ticket_datamodel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: johannes
--

ALTER SEQUENCE ticket_datamodel_id_seq OWNED BY ticket_datamodel.id;


--
-- Name: ticket_id_seq; Type: SEQUENCE; Schema: public; Owner: johannes
--

CREATE SEQUENCE ticket_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ticket_id_seq OWNER TO johannes;

--
-- Name: ticket_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: johannes
--

ALTER SEQUENCE ticket_id_seq OWNED BY ticket.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: johannes; Tablespace: 
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


ALTER TABLE public."user" OWNER TO johannes;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: johannes
--

CREATE SEQUENCE user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_id_seq OWNER TO johannes;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: johannes
--

ALTER SEQUENCE user_id_seq OWNED BY "user".id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: johannes
--

ALTER TABLE ONLY agent ALTER COLUMN id SET DEFAULT nextval('agent_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: johannes
--

ALTER TABLE ONLY blacklist ALTER COLUMN id SET DEFAULT nextval('blacklist_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: johannes
--

ALTER TABLE ONLY comment ALTER COLUMN id SET DEFAULT nextval('comment_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: johannes
--

ALTER TABLE ONLY customer ALTER COLUMN id SET DEFAULT nextval('customer_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: johannes
--

ALTER TABLE ONLY customer_datamodel ALTER COLUMN id SET DEFAULT nextval('customer_datamodel_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: johannes
--

ALTER TABLE ONLY customer_datatype ALTER COLUMN id SET DEFAULT nextval('customer_datatype_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: johannes
--

ALTER TABLE ONLY ticket ALTER COLUMN id SET DEFAULT nextval('ticket_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: johannes
--

ALTER TABLE ONLY ticket_datamodel ALTER COLUMN id SET DEFAULT nextval('ticket_datamodel_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: johannes
--

ALTER TABLE ONLY "user" ALTER COLUMN id SET DEFAULT nextval('user_id_seq'::regclass);


--
-- Name: Customer_email_key; Type: CONSTRAINT; Schema: public; Owner: johannes; Tablespace: 
--

ALTER TABLE ONLY customer
    ADD CONSTRAINT "Customer_email_key" UNIQUE (email_contact);


--
-- Name: Customer_name_key; Type: CONSTRAINT; Schema: public; Owner: johannes; Tablespace: 
--

ALTER TABLE ONLY customer
    ADD CONSTRAINT "Customer_name_key" UNIQUE (name);


--
-- Name: Customer_pkey; Type: CONSTRAINT; Schema: public; Owner: johannes; Tablespace: 
--

ALTER TABLE ONLY customer
    ADD CONSTRAINT "Customer_pkey" PRIMARY KEY (id);


--
-- Name: agent_pkey; Type: CONSTRAINT; Schema: public; Owner: johannes; Tablespace: 
--

ALTER TABLE ONLY agent
    ADD CONSTRAINT agent_pkey PRIMARY KEY (id);


--
-- Name: blacklist_email_key; Type: CONSTRAINT; Schema: public; Owner: johannes; Tablespace: 
--

ALTER TABLE ONLY blacklist
    ADD CONSTRAINT blacklist_email_key UNIQUE (email);


--
-- Name: blacklist_pkey; Type: CONSTRAINT; Schema: public; Owner: johannes; Tablespace: 
--

ALTER TABLE ONLY blacklist
    ADD CONSTRAINT blacklist_pkey PRIMARY KEY (id);


--
-- Name: comments_pkey; Type: CONSTRAINT; Schema: public; Owner: johannes; Tablespace: 
--

ALTER TABLE ONLY comment
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: customer_datamodel_pkey; Type: CONSTRAINT; Schema: public; Owner: johannes; Tablespace: 
--

ALTER TABLE ONLY customer_datamodel
    ADD CONSTRAINT customer_datamodel_pkey PRIMARY KEY (id);


--
-- Name: customer_datatype_datatype_key; Type: CONSTRAINT; Schema: public; Owner: johannes; Tablespace: 
--

ALTER TABLE ONLY customer_datatype
    ADD CONSTRAINT customer_datatype_datatype_key UNIQUE (datatype);


--
-- Name: customer_datatype_pkey; Type: CONSTRAINT; Schema: public; Owner: johannes; Tablespace: 
--

ALTER TABLE ONLY customer_datatype
    ADD CONSTRAINT customer_datatype_pkey PRIMARY KEY (id);


--
-- Name: ticket_datamodel_pkey; Type: CONSTRAINT; Schema: public; Owner: johannes; Tablespace: 
--

ALTER TABLE ONLY ticket_datamodel
    ADD CONSTRAINT ticket_datamodel_pkey PRIMARY KEY (id);


--
-- Name: ticket_pkey; Type: CONSTRAINT; Schema: public; Owner: johannes; Tablespace: 
--

ALTER TABLE ONLY ticket
    ADD CONSTRAINT ticket_pkey PRIMARY KEY (id);


--
-- Name: user_pkey; Type: CONSTRAINT; Schema: public; Owner: johannes; Tablespace: 
--

ALTER TABLE ONLY "user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: comment_fk_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: johannes
--

ALTER TABLE ONLY comment
    ADD CONSTRAINT comment_fk_agent_id_fkey FOREIGN KEY (fk_agent_id) REFERENCES agent(id);


--
-- Name: comment_fk_previous_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: johannes
--

ALTER TABLE ONLY comment
    ADD CONSTRAINT comment_fk_previous_comment_id_fkey FOREIGN KEY (fk_previous_comment_id) REFERENCES comment(id);


--
-- Name: comment_fk_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: johannes
--

ALTER TABLE ONLY comment
    ADD CONSTRAINT comment_fk_ticket_id_fkey FOREIGN KEY (fk_ticket_id) REFERENCES ticket(id);


--
-- Name: comment_fk_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: johannes
--

ALTER TABLE ONLY comment
    ADD CONSTRAINT comment_fk_user_id_fkey FOREIGN KEY (fk_user_id) REFERENCES "user"(id);


--
-- Name: customer_datamodel_fk_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: johannes
--

ALTER TABLE ONLY customer_datamodel
    ADD CONSTRAINT customer_datamodel_fk_customer_id_fkey FOREIGN KEY (fk_customer_id) REFERENCES customer(id);


--
-- Name: customer_datamodel_fk_datatype_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: johannes
--

ALTER TABLE ONLY customer_datamodel
    ADD CONSTRAINT customer_datamodel_fk_datatype_id_fkey FOREIGN KEY (fk_datatype_id) REFERENCES customer_datatype(id);


--
-- Name: customer_fk_created_by_admin_fkey; Type: FK CONSTRAINT; Schema: public; Owner: johannes
--

ALTER TABLE ONLY customer
    ADD CONSTRAINT customer_fk_created_by_admin_fkey FOREIGN KEY (fk_created_by_admin) REFERENCES agent(id);


--
-- Name: ticket_datamodel_fk_datamodel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: johannes
--

ALTER TABLE ONLY ticket_datamodel
    ADD CONSTRAINT ticket_datamodel_fk_datamodel_id_fkey FOREIGN KEY (fk_datamodel_id) REFERENCES customer_datamodel(id);


--
-- Name: ticket_datamodel_fk_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: johannes
--

ALTER TABLE ONLY ticket_datamodel
    ADD CONSTRAINT ticket_datamodel_fk_ticket_id_fkey FOREIGN KEY (fk_ticket_id) REFERENCES ticket(id);


--
-- Name: ticket_fk_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: johannes
--

ALTER TABLE ONLY ticket
    ADD CONSTRAINT ticket_fk_agent_id_fkey FOREIGN KEY (fk_agent_id) REFERENCES agent(id);


--
-- Name: ticket_fk_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: johannes
--

ALTER TABLE ONLY ticket
    ADD CONSTRAINT ticket_fk_user_id_fkey FOREIGN KEY (fk_user_id) REFERENCES "user"(id);


--
-- Name: user_fk_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: johannes
--

ALTER TABLE ONLY "user"
    ADD CONSTRAINT user_fk_customer_id_fkey FOREIGN KEY (fk_customer_id) REFERENCES customer(id);


--
-- Name: public; Type: ACL; Schema: -; Owner: johannes
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM johannes;
GRANT ALL ON SCHEMA public TO johannes;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

