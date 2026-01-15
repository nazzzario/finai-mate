package com.finai.mate.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender emailSender;

    public void sendSimpleMessage(String to, String subject, String text) {
        // Mock sending email to avoid SMTP errors in dev
        System.out.println("------------------------------------------------");
        System.out.println("Simulating Email Send:");
        System.out.println("To: " + to);
        System.out.println("Subject: " + subject);
        System.out.println("Body: " + text);
        System.out.println("------------------------------------------------");
    }
}
