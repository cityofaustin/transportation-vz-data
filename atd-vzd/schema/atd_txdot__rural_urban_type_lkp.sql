--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6
-- Dumped by pg_dump version 10.10

-- Started on 2019-10-15 13:56:34 CDT

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 320 (class 1259 OID 2346125)
-- Name: atd_txdot__rural_urban_type_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__rural_urban_type_lkp (
    rural_urban_type_id integer NOT NULL,
    rural_urban_type_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__rural_urban_type_lkp OWNER TO atd_vz_data;

--
-- TOC entry 5618 (class 2606 OID 2346660)
-- Name: atd_txdot__rural_urban_type_lkp atd_txdot__rural_urban_type_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__rural_urban_type_lkp
    ADD CONSTRAINT atd_txdot__rural_urban_type_lkp_pk PRIMARY KEY (rural_urban_type_id);


-- Completed on 2019-10-15 13:56:37 CDT

--
-- PostgreSQL database dump complete
--

