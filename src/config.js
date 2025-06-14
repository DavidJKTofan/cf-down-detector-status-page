// src/config.js

export const endpoints = {
	cloudflare: {
		name: 'Cloudflare',
		urls: [
			{
				url: 'https://www.cloudflare.com/',
				description: 'Cloudflare Homepage',
			},
			{
				url: 'https://one.dash.cloudflare.com/',
				description: 'Cloudflare Zero Trust',
			},
			{
				url: 'https://one.one.one.one/',
				description: 'Cloudflare Public DNS Resolver',
			},
		],
	},
	zscaler: {
		name: 'Zscaler',
		urls: [
			{
				url: 'https://admin.zscaler.net/',
				description: 'Zscaler Admin Portal',
			},
			{
				url: 'https://admin.zscalerone.net/',
				description: 'Zscaler One',
			},
			{
				url: 'https://admin.zscalertwo.net/',
				description: 'Zscaler Two',
			},
			{
				url: 'https://admin.zscalerthree.net/',
				description: 'Zscaler Three',
			},
			{
				url: 'https://admin.zscalerbeta.net/',
				description: 'Zscaler Beta',
			},
			{
				url: 'https://admin.zscloud.net/',
				description: 'Zscaler Cloud',
			},
			{
				url: 'https://admin.private.zscaler.com/',
				description: 'Zscaler Private',
			},
			{
				url: 'https://admin.zpatwo.net/',
				description: 'ZPA Two',
			},
		],
	},
	cato: {
		name: 'Cato Networks',
		urls: [
			{
				url: 'https://auth.catonetworks.com/',
				description: 'Cato Management Portal',
			},
		],
	},
	netskope: {
		name: 'Netskope',
		urls: [
			{
				url: 'https://netskope.goskope.com/ns#/login',
				description: 'Netskope Security Cloud',
			},
		],
	},
	forcepoint: {
		name: 'Forcepoint',
		urls: [
			{
				url: 'https://admin.forcepoint.net/login/login_form.mhtml',
				description: 'Forcepoint Admin Portal',
			},
		],
	},
	fastly: {
		name: 'Fastly',
		urls: [
			{
				url: 'https://manage.fastly.com/',
				description: 'Fastly Management Portal',
			},
		],
	},
	akamai: {
		name: 'Akamai',
		urls: [
			{
				url: 'https://control.akamai.com/apps/auth/#/login',
				description: 'Akamai Control Center',
			},
		],
	},
	linode: {
		name: 'Linode',
		urls: [
			{
				url: 'https://login.linode.com/login',
				description: 'Linode Cloud Manager',
			},
		],
	},
	google: {
		name: 'Google',
		urls: [
			{
				url: 'https://cloud.google.com/',
				description: 'Google Cloud Platform',
			},
			{
				url: 'https://dns.google/',
				description: 'Google Public DNS',
			},
		],
	},
	aws: {
		name: 'Amazon Web Services',
		urls: [
			{
				url: 'https://aws.amazon.com/',
				description: 'Amazon Web Services Homepage',
			},
			{
				url: 'https://eu-west-1.signin.aws.amazon.com/',
				description: 'AWS Management Console EU West 1',
			},
			{
				url: 'https://eu-central-1.signin.aws.amazon.com/',
				description: 'AWS Management Console EU Central 1',
			},
		],
	},
	microsoft: {
		name: 'Microsoft',
		urls: [
			{
				url: 'https://azure.microsoft.com/en-us/',
				description: 'Microsoft Azure',
			},
			{
				url: 'https://login.microsoftonline.com/',
				description: 'Microsoft Azure Portal',
			},
		],
	},
	oracle: {
		name: 'Oracle',
		urls: [
			{
				url: 'https://signon.oracle.com/signin',
				description: 'Oracle Cloud',
			},
			{
				url: 'https://cloud.oracle.com/',
				description: 'Oracle Account Management',
			},
		],
	},
	ibm: {
		name: 'IBM',
		urls: [
			{
				url: 'https://cloud.ibm.com/login',
				description: 'IBM Cloud',
			},
		],
	},
};
