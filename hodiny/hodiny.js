// Hodiny  : bibliothèque JavaScript pour dessiner des horloges
// Auteur  : Corentin Robin
// Version : 18 avril 2018

// la fréquence de rafraîssiment et les couleurs par défaut sont basées sur la Longines Record réf. L2.821.4.11.6
// ordre de tracés : graduations, aiguilles, point central

var Hodiny =
{
    UTCDate : function(utc_zone)
    {
        var sign = (utc_zone[0] == "-" ? -1 : 1),
            utc_zone = utc_zone.replace(/[\+\-]/g, ""),
            values = utc_zone.split(/[\+\-:]/),
            offset = sign * (Number(values[0]) * 60 + Number(values[1]));

        var local_time = new Date(), utc_minus_local = local_time.getTimezoneOffset(),
            zone_time = new Date(local_time.getTime() + local_time.getTimezoneOffset() * 60 * 1000 + offset * 60 * 1000);

        return zone_time;
    },

    attribute : function(attribute, element, default_value)
    {
        return (element.getAttribute(attribute) == null || element.getAttribute(attribute) == "" ? default_value : element.getAttribute(attribute));
    },

    drawClock : function(element)
    {
        var canvas = element.getContext("2d");

        // paramètres personnalisables
        var utc_zone = Hodiny.attribute("utc-zone", element, ""),
            size = Hodiny.attribute("size", element, 300),
            text = Hodiny.attribute("text", element, ""),
            text_color = Hodiny.attribute("text-color", element, "black"),
            text_size = Hodiny.attribute("text-size", element, 10),
            hours_text = Hodiny.attribute("hours-text", element, "false"),
            font = Hodiny.attribute("font", element, "Verdana"),
            layout_color = Hodiny.attribute("layout-color", element, "#919190"),
            background_color = Hodiny.attribute("background-color", element, "#f0efed"),
            graduations_color = Hodiny.attribute("graduations-color", element, "#252525"),
            hands_color = Hodiny.attribute("hands-color", element, "#012a58");
        text_size = Number(text_size);

        var today = new Date(), date;

        if(utc_zone == "") date = today;

        else date = Hodiny.UTCDate(utc_zone);

        var seconds = date.getSeconds() + date.getMilliseconds() / 1000,
            minutes = date.getMinutes(),
            hours = date.getHours();

        minutes += seconds / 60;
        hours += minutes / 60;

        // paramètres internes
        var half_size = size / 2;
        var second_hand_size = half_size * 0.9, minute_hand_size = half_size * 0.8, hour_hand_size = half_size * 0.5;
        var graduation_size = 10;
        var inner_radius = half_size - 1;

        // variables liées aux calculs
        var angle_correction = - Math.PI / 2;

        // initialisation du canvas
        element.width = size;
        element.height = size;

        // CADRAN
        canvas.strokeStyle = layout_color;

        canvas.beginPath();
        canvas.arc(half_size, half_size, half_size - 1, 0, 2 * Math.PI);
        canvas.stroke();

        canvas.fillStyle = background_color;

        canvas.beginPath();
        canvas.arc(half_size, half_size, half_size - 1, 0, 2 * Math.PI);
        canvas.fill();

        // GRADUATIONS
        canvas.strokeStyle = graduations_color;
        canvas.fillStyle = graduations_color;

        for(i = 0; i < 60; i++)
        {
            angle = i / 60;

            if(i % 5 == 0)
            {
                canvas.lineWidth = 4;

                if(hours_text == "true")
                {
                    hour_text = i / 5;
                    graduation_size = half_size * 0.05;
                    font_size = size * 0.08;
                    canvas.font = font_size + "px " + font;
                    text_width = canvas.measureText(hour_text).width;

                    canvas.fillText(i / 5, 
                                    half_size - text_width / 2 + Math.cos(angle * 2 * Math.PI + angle_correction) * (inner_radius - size * 0.08),
                                    half_size + font_size / 2 + Math.sin(angle * 2 * Math.PI + angle_correction) * (inner_radius - size * 0.08));
                }

                else
                    graduation_size = half_size * 0.2;
            }

            else
            {
                graduation_size = half_size * 0.05;
                canvas.lineWidth = 1;
            }

            canvas.beginPath();
            canvas.moveTo(half_size + Math.cos(angle * 2 * Math.PI + angle_correction) * (inner_radius - graduation_size),
                        half_size + Math.sin(angle * 2 * Math.PI + angle_correction) * (inner_radius - graduation_size));

            canvas.lineTo(half_size + Math.cos(angle * 2 * Math.PI + angle_correction) * inner_radius,
                        half_size + Math.sin(angle * 2 * Math.PI + angle_correction) * inner_radius);
            canvas.stroke();
        }

        // TEXTE
        canvas.fillStyle = text_color;
        canvas.font =  text_size + "px " + font;
        var text_width = canvas.measureText(text).width;

        canvas.fillText(text, half_size - text_width / 2, half_size / 2 + text_size / 2);

        // AIGUILLES
        canvas.strokeStyle = hands_color;

        // Heures
        canvas.lineWidth = 0.02 * size;

        canvas.beginPath();
        canvas.moveTo(half_size, half_size);
        canvas.lineTo(half_size + Math.cos((hours % 12) / 12 * 2 * Math.PI + angle_correction) * hour_hand_size,
                    half_size + Math.sin((hours % 12) / 12 * 2 * Math.PI + angle_correction) * hour_hand_size);
        canvas.stroke();

        // Minutes
        canvas.lineWidth = 0.015 * size;

        canvas.beginPath();
        canvas.moveTo(half_size, half_size);
        canvas.lineTo(half_size + Math.cos(minutes / 60 * 2 * Math.PI + angle_correction) * minute_hand_size,
                    half_size + Math.sin(minutes / 60 * 2 * Math.PI + angle_correction) * minute_hand_size);
        canvas.stroke();

        // Secondes
        canvas.lineWidth = 0.01 * size;

        canvas.beginPath();
        canvas.moveTo(half_size, half_size);
        canvas.lineTo(half_size + Math.cos(seconds / 60 * 2 * Math.PI + angle_correction) * second_hand_size,
                    half_size + Math.sin(seconds / 60 * 2 * Math.PI + angle_correction) * second_hand_size);
        canvas.stroke();

        // POINT CENTRAL
        canvas.fillStyle = hands_color;

        canvas.beginPath();
        canvas.arc(half_size, half_size, 0.04 * size, 0, 2 * Math.PI);
        canvas.fill();
    },

    drawClocks : function()
    {
        var clocks = document.querySelectorAll("canvas.clock"), i;

        for(i = 0; i < clocks.length; i++)
        {
            Hodiny.drawClock(clocks[i]);
        }
    }
}

window.addEventListener("load", function()
{
    window.setInterval(Hodiny.drawClocks, 1 / 7 * 1000);
});